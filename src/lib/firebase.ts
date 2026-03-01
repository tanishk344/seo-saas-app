import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { firebaseConfig } from "@/config/firebase";
import type { User, UserPlan, Audit, Keyword, GeneratedContent, AuditResults } from "@/types";

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export const firebase = {
  auth,
  db,
};

export const authService = {
  async signUp(email: string, password: string, name: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const currentMonth = new Date().toISOString().slice(0, 7);

    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      name,
      plan: "free" as UserPlan,
      createdAt: serverTimestamp(),
      usage: {
        audits: 0,
        keywords: 0,
        contentGenerations: 0,
        month: currentMonth,
      },
      subscription: null,
    });

    return user;
  },

  async signIn(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      const currentMonth = new Date().toISOString().slice(0, 7);
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name: user.displayName || "User",
        plan: "free" as UserPlan,
        createdAt: serverTimestamp(),
        usage: {
          audits: 0,
          keywords: 0,
          contentGenerations: 0,
          month: currentMonth,
        },
        subscription: null,
      });
    }

    return user;
  },

  async signOut() {
    await signOut(auth);
  },

  async resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  },

  onAuthChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  getCurrentUser() {
    return auth.currentUser;
  },
};

export const userService = {
  async getUser(userId: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) return null;

    const data = userDoc.data();
    return {
      id: userId,
      email: data.email,
      name: data.name,
      plan: data.plan,
      createdAt: data.createdAt?.toDate() || new Date(),
      usage: data.usage,
      subscription: data.subscription,
    };
  },

  async updateUserPlan(userId: string, plan: UserPlan, subscription?: { stripeId: string; status: string; expiresAt: Date }) {
    const userRef = doc(db, "users", userId);
    const updateData: Record<string, unknown> = { plan };

    if (subscription) {
      updateData.subscription = {
        stripeId: subscription.stripeId,
        status: subscription.status,
        expiresAt: Timestamp.fromDate(subscription.expiresAt),
      };
    }

    await updateDoc(userRef, updateData);
  },

  async updateUsage(userId: string, type: "audits" | "keywords" | "contentGenerations") {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) return;

    const userData = userDoc.data();
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    let usage = userData.usage || { audits: 0, keywords: 0, contentGenerations: 0, month: currentMonth };

    if (usage.month !== currentMonth) {
      usage = { audits: 0, keywords: 0, contentGenerations: 0, month: currentMonth };
    }

    usage[type] = (usage[type] || 0) + 1;

    await updateDoc(userRef, { usage });
  },

  async checkLimit(userId: string, type: "audits" | "keywords" | "contentGenerations", limit: number): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;

    if (user.plan === "pro") return true;

    const currentMonth = new Date().toISOString().slice(0, 7);
    if (user.usage.month !== currentMonth) return true;

    return user.usage[type] < limit;
  },
};

export const auditService = {
  async createAudit(userId: string, url: string, score: number, results: AuditResults): Promise<string> {
    const auditRef = await addDoc(collection(db, "audits"), {
      userId,
      url,
      score,
      results,
      date: serverTimestamp(),
    });
    return auditRef.id;
  },

  async getAudits(userId: string): Promise<Audit[]> {
    const q = query(
      collection(db, "audits"),
      where("userId", "==", userId),
      orderBy("date", "desc"),
      limit(20)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() || new Date(),
    })) as Audit[];
  },
};

export const keywordService = {
  async addKeyword(userId: string, keyword: string): Promise<string> {
    const mockRank = Math.floor(Math.random() * 100) + 1;
    
    const keywordRef = await addDoc(collection(db, "keywords"), {
      userId,
      keyword,
      currentRank: mockRank,
      history: [{ rank: mockRank, date: serverTimestamp() }],
      createdAt: serverTimestamp(),
    });
    return keywordRef.id;
  },

  async getKeywords(userId: string): Promise<Keyword[]> {
    const q = query(
      collection(db, "keywords"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        history: data.history?.map((h: { rank: number; date: unknown }) => ({
          ...h,
          date: (h.date as Timestamp)?.toDate() || new Date(),
        })) || [],
      };
    }) as Keyword[];
  },

  async deleteKeyword(keywordId: string) {
    await deleteDoc(doc(db, "keywords", keywordId));
  },

  async updateKeywordRank(keywordId: string, newRank: number) {
    const keywordRef = doc(db, "keywords", keywordId);
    const keywordDoc = await getDoc(keywordRef);
    
    if (!keywordDoc.exists()) return;

    const data = keywordDoc.data();
    const history = data.history || [];
    history.push({ rank: newRank, date: serverTimestamp() });

    await updateDoc(keywordRef, {
      currentRank: newRank,
      history,
    });
  },
};

export const contentService = {
  async saveContent(
    userId: string,
    topic: string,
    contentType: string,
    tone: string,
    generatedContent: string
  ): Promise<string> {
    const contentRef = await addDoc(collection(db, "content"), {
      userId,
      topic,
      contentType,
      tone,
      generatedContent,
      createdAt: serverTimestamp(),
    });
    return contentRef.id;
  },

  async getContent(userId: string): Promise<GeneratedContent[]> {
    const q = query(
      collection(db, "content"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as GeneratedContent[];
  },
};
