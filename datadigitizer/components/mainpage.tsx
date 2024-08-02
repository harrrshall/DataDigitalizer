"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuthStore } from "@/lib/authStore";

const db = getFirestore();
const auth = getAuth();
const googleProvider = new GoogleAuthProvider();

export function MainPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { user, error, setError, logout } = useAuthStore();

  useEffect(() => {
    if (user) {
      router.push("/uploadimage");
    }
  }, [user, router]);

  const handleGoogleAuth = async (action: "login" | "signup") => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date(),
          creditsRemaining: 10,
          totalDocuments: 0,
          pagesDigitized: 0
        });
      } else {
        await setDoc(userRef, { lastLogin: new Date() }, { merge: true });
      }

      useAuthStore.getState().setUser(user);
      router.push("/uploadimage");
    } catch (error) {
      if (error instanceof Error) {
        console.error("Authentication error:", error);
        setError(`Authentication failed: ${error.message}`);
      } else {
        console.error("Unknown authentication error:", error);
        setError("An unknown error occurred during authentication");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('key-features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="flex items-center justify-between px-4 lg:px-8 py-4 bg-background border-b">
        <Link href="#" className="flex items-center gap-2" prefetch={false}>
          <MountainIcon className="h-6 w-6" />
          <span className="text-lg font-bold">Data Digitizer</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex lg:items-center lg:gap-6">
          <Link href="#" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false} onClick={scrollToFeatures}>
            Features
          </Link>
          <Link href="#" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false} onClick={scrollToFeatures}>
            Use Cases
          </Link>
          <Link href="#" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Pricing
          </Link>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Log Out
            </Button>
          ) : (
            <>
              <Button size="sm" onClick={() => handleGoogleAuth("signup")} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Start Free Trial'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleGoogleAuth("login")} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Log In'}
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden relative">
          <button
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <XIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>

          {/* Mobile Menu Dropdown */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => { scrollToFeatures(); setIsMenuOpen(false); }}>
                Features
              </Link>
              <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => { scrollToFeatures(); setIsMenuOpen(false); }}>
                Use Cases
              </Link>
              <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsMenuOpen(false)}>
                Pricing
              </Link>
              {user ? (
                <Button variant="ghost" size="sm" onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Log Out
                </Button>
              ) : (
                <>
                  <Button size="sm" onClick={() => { handleGoogleAuth("signup"); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Start Free Trial'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { handleGoogleAuth("login"); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Log In'}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </header>
      <main className="flex-1">
        <section className="relative w-full h-[500px] bg-gradient-to-r from-blue-600 to-purple-600">          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/20 flex items-center">
          <div className="container px-4 lg:px-8 space-y-4">
            <h1 className="text-4xl lg:text-6xl font-bold text-white">                Modernize your business with AI-powered document processing
            </h1>
            <div className="flex flex-col items-start gap-4 max-w-md">
            <Button onClick={() => handleGoogleAuth("signup")} className="w-full bg-white text-blue-600 hover:bg-green-500" disabled={isLoading}>                {isLoading ? 'Loading...' : 'start with free credits'}
              </Button>
            </div>
            {error && <p className="text-red-500">{error}</p>}
          </div>
        </div>
        </section>
        <section id="key-features" className="py-12 lg:py-24">
          <div className="container px-4 lg:px-8">
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl lg:text-5xl font-bold">Key Features</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-background p-6 rounded-lg shadow-md hover:text-black hover:bg-blue-500 hover:text-white transition-colors">
                  <Image src="./image-enhancement-icon.svg" width="64" height="64" alt="Image Enhancement" className="mb-4" />
                  <h3 className="text-xl font-bold mb-2 hover:text-black">Image Enhancement</h3>
                  <p className="text-muted-foreground hover:text-black">
                    Improve the quality of your handwritten data entries with advanced image processing algorithms.
                  </p>
                </div>
                <div className="bg-background p-6 rounded-lg shadow-md hover:bg-blue-500 hover:text-white transition-colors">
                  <Image src="/document-type-detection-icon.svg" width="64" height="64" alt="Document Type Detection" className="mb-4" />
                  <h3 className="text-xl font-bold mb-2 hover:text-black">Document Type Detection                  </h3>
                  <p className="text-muted-foreground hover:text-black">
                    Automatically identify the type of document, making it easier to process and organize your handwritten notes.                  </p>
                </div>
                <div className="bg-background p-6 rounded-lg shadow-md hover:bg-blue-500 hover:text-white transition-colors">
                  <Image
                    src="/ocr-icon.svg"
                    width="64"
                    height="64"
                    alt="Optical Character Recognition"
                    className="mb-4"
                  />
                  <h3 className="text-xl font-bold mb-2 hover:text-black">Optical Character Recognition                  </h3>
                  <p className="text-muted-foreground hover:text-black">
                    Extract text from your handwritten documents with high accuracy, enabling efficient data extraction and indexing.                  </p>
                </div>
                <div className="bg-background p-6 rounded-lg shadow-md hover:bg-blue-500 hover:text-white transition-colors">
                  <Image src="/data-extraction-icon.svg" width="64" height="64" alt="Data Extraction" className="mb-4" />
                  <h3 className="text-xl font-bold mb-2 hover:text-black">Data Extraction                  </h3>
                  <p className="text-muted-foreground hover:text-black">
                    Automatically extract key data from your handwritten documents, saving time and reducing errors.                  </p>
                </div>
                <div className="bg-background p-6 rounded-lg shadow-md hover:bg-blue-500 hover:text-white transition-colors">
                  <Image src="/automated-workflows-icon.svg" width="64" height="64" alt="Automated Workflows" className="mb-4" />
                  <h3 className="text-xl font-bold mb-2 hover:text-black">Automated Workflows                  </h3>
                  <p className="text-muted-foreground hover:text-black">
                    Streamline your document processing with customizable workflows, reducing manual effort and increasing efficiency.                  </p>
                </div>
                <div className="bg-background p-6 rounded-lg shadow-md hover:bg-blue-500 hover:text-white transition-colors">
                  <Image src="/secure-storage-icon.svg" width="64" height="64" alt="Secure Storage" className="mb-4" />
                  <h3 className="text-xl font-bold mb-2 hover:text-black">Secure Storage
                  </h3>
                  <p className="text-muted-foreground hover:text-black">
                    Keep your handwritten documents safe and compliant with our secure storage and access controls, ensuring data privacy and integrity.                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-muted p-6 md:py-12 w-full">
        <div className="container max-w-7xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 text-sm">
          <div className="grid gap-1">
            <h3 className="font-semibold">Company</h3>
            <Link href="#" prefetch={false}>
              About Us
            </Link>
            <Link href="#" prefetch={false}>
              Our Team
            </Link>
            <Link href="#" prefetch={false}>
              Careers
            </Link>
            <Link href="#" prefetch={false}>
              News
            </Link>
          </div>
          <div className="grid gap-1">
            <h3 className="font-semibold">Products</h3>
            <Link href="#" prefetch={false}>
              Data Digitizer
            </Link>
            <Link href="#" prefetch={false}>
              Document Automation
            </Link>
            <Link href="#" prefetch={false}>
              Workflow Optimizer
            </Link>
            <Link href="#" prefetch={false}>
              Analytics
            </Link>
          </div>
          <div className="grid gap-1">
            <h3 className="font-semibold">Resources</h3>
            <Link href="#" prefetch={false}>
              Blog
            </Link>
            <Link href="#" prefetch={false}>
              Documentation
            </Link>
            <Link href="#" prefetch={false}>
              Support
            </Link>
            <Link href="#" prefetch={false}>
              FAQs
            </Link>
          </div>
          <div className="grid gap-1">
            <h3 className="font-semibold">Legal</h3>
            <Link href="#" prefetch={false}>
              Privacy Policy
            </Link>
            <Link href="#" prefetch={false}>
              Terms of Service
            </Link>
            <Link href="#" prefetch={false}>
              Cookie Policy
            </Link>
          </div>
          <div className="grid gap-1">
            <h3 className="font-semibold">Contact</h3>
            <Link href="#" prefetch={false}>
              Sales
            </Link>
            <Link href="#" prefetch={false}>
              Support
            </Link>
            <Link href="#" prefetch={false}>
              Partnerships
            </Link>
            <Link href="#" prefetch={false}>
              Press
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}


interface IconProps {
  className?: string;
  [key: string]: any;
}

function MountainIcon(props: IconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  )
}

function XIcon(props: IconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

export function MenuIcon(props: IconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  )
}