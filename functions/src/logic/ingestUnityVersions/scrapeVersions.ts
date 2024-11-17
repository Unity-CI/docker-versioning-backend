import { EditorVersionInfo } from "../../model/editorVersionInfo";
import { searchChangesets, SearchMode } from "unity-changeset";

const unity_version_regex = /^(\d+)\.(\d+)\.(\d+)([a-zA-Z]+)(-?\d+)$/;

export const scrapeVersions = async (): Promise<EditorVersionInfo[]> => {
  const unityVersions = await searchChangesets(SearchMode.Default);

  if (unityVersions?.length > 0) {
    return unityVersions
      .map((unityVersion) => {
        const match = RegExp(unity_version_regex).exec(unityVersion.version);
        if (match) {
          const [_, major, minor, patch, lifecycle, build] = match;

          if (lifecycle !== "f" || Number(major) < 2017) {
            return null;
          }

          return {
            version: unityVersion.version,
            changeSet: unityVersion.changeset,
            major: Number(major),
            minor: Number(minor),
            patch,
          } as EditorVersionInfo;
        }
        return null;
      })
      .filter((versionInfo): versionInfo is EditorVersionInfo =>
        versionInfo !== null
      );
  }

  throw new Error("No Unity versions found!");
};
