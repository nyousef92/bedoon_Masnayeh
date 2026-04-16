import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  WhereFilterOp,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── GET ALL documents from a collection ────────────────────────────────────
export async function getAll(collectionName: string) {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// ─── GET ONE document by ID ──────────────────────────────────────────────────
export async function getById(collectionName: string, id: string) {
  const ref = doc(db, collectionName, id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

// ─── ADD a new document (Firestore auto-generates the ID) ───────────────────
export async function addItem(collectionName: string, data: DocumentData) {
  const ref = await addDoc(collection(db, collectionName), data);
  return ref.id;
}

// ─── SET a document with a specific ID (creates or overwrites) ───────────────
export async function setItem(collectionName: string, id: string, data: DocumentData) {
  const ref = doc(db, collectionName, id);
  await setDoc(ref, data);
}

// ─── UPDATE specific fields of an existing document ─────────────────────────
export async function updateItem(collectionName: string, id: string, data: Partial<DocumentData>) {
  const ref = doc(db, collectionName, id);
  await updateDoc(ref, data);
}

// ─── DELETE a document by ID ─────────────────────────────────────────────────
export async function deleteItem(collectionName: string, id: string) {
  const ref = doc(db, collectionName, id);
  await deleteDoc(ref);
}

// ─── QUERY documents with a filter ──────────────────────────────────────────
// Example: queryItems("users", "age", ">=", 18)
export async function queryItems(
  collectionName: string,
  field: string,
  operator: WhereFilterOp,
  value: unknown
) {
  const q = query(collection(db, collectionName), where(field, operator, value));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
