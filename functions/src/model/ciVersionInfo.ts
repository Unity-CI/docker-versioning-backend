import { db, admin, firebase } from '../config/firebase';
import Timestamp = admin.firestore.Timestamp;
import { EditorVersionInfo } from './editorVersionInfo';
import { RepoVersionInfo } from './repoVersions';

const COLLECTION = 'builtVersions';

export interface CiVersionInfo {
  editorVersion: EditorVersionInfo;
  repoVersion: RepoVersionInfo;
  addedDate?: Timestamp;
  modifiedDate?: Timestamp;
}

export class CiVersionInfo {
  static getAll = async (): Promise<CiVersionInfo[]> => {
    const snapshot = await db
      .collection(COLLECTION)
      .orderBy('editorVersion.major', 'desc')
      .orderBy('editorVersion.minor', 'desc')
      .orderBy('editorVersion.patch', 'desc')
      .orderBy('repoVersion.major', 'desc')
      .orderBy('repoVersion.minor', 'desc')
      .orderBy('repoVersion.patch', 'desc')
      .get();

    return snapshot.docs.map((doc) => doc.data()) as CiVersionInfo[];
  };

  static create = async (editorVersion: EditorVersionInfo, repoVersion: RepoVersionInfo) => {
    try {
      await db.collection(COLLECTION).doc('some elaborate id').set({
        editorVersion,
        repoVersion,
        addedDate: Timestamp.now(),
      });
    } catch (err) {
      firebase.logger.error('Error occurred during batch commit of new version', err);
    }
  };
}
