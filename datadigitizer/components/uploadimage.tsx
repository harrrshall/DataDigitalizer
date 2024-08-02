'use client'
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/lib/authStore";
import { ProcessImage } from './processimage';
import { getAuth } from 'firebase/auth';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getFirestore, doc, getDoc, setDoc, updateDoc, DocumentData, onSnapshot } from 'firebase/firestore';
import { UserHistory } from './UserHistory';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const db = getFirestore();

interface ProcessedData {
  docId: string;
  preview: any[];
  csvUrl: string;
  newCredits: number;
  newTotalDocuments: number;
  newPagesDigitized: number;
}

export function UploadImage() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedData = localStorage.getItem('processedData');
    if (storedData) {
      setProcessedData(JSON.parse(storedData));
    }
  }, []);
  
  const handleLogout = async () => {
    try {
      await logout();
      setProcessedData(null); // Clear processedData state
      localStorage.removeItem('processedData'); // Remove processedData from localStorage
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'application/pdf')) {
      setSelectedFile(file);
      setError(null);
    } else {
      setError('Please select a valid file format (PNG, JPEG, PDF)');
      event.target.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDigitaliseClick = async () => {
    if (selectedFile) {
      setIsLoading(true);
      setError(null);

      try {
        const auth = getAuth();
        const user = auth.currentUser;
        const token = user ? await user.getIdToken() : null;

        if (!token) {
          throw new Error('User not authenticated');
        }

        const formData = new FormData();
        formData.append('image', selectedFile);

        const response = await fetch(`${API_URL}/processImage`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'An error occurred while processing the image');
        }

        const data: ProcessedData = await response.json();

        if (data.preview && data.preview.length === 1 && data.preview[0]["ERROR: Image contains primarily non-textual content "]) {
          throw new Error("Please provide a proper image with textual content.");
        }

        // Update user data in Firestore with fallback values
        const userRef = doc(db, 'users', user!.uid);
        await updateDoc(userRef, {
          creditsRemaining: data.newCredits ?? 0,
          totalDocuments: data.newTotalDocuments ?? 0,
          pagesDigitized: data.newPagesDigitized ?? 0
        });

        setProcessedData(data);
        localStorage.setItem('processedData', JSON.stringify(data));
      } catch (error: any) {
        console.error("Error:", error);
        setError(error.message || "An error occurred while processing the image. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleProcessingComplete = () => {
    setSelectedFile(null);
    localStorage.removeItem('processedData');
    setProcessedData(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-background border-b flex items-center justify-between px-6 py-4">
        <Link href="#" className="flex items-center gap-2 font-bold text-lg" prefetch={false}>
          <MountainIcon className="w-6 h-6" />
          <span>Data Digitizer</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#" className="text-muted-foreground hover:text-foreground" prefetch={false}>
            Dashboard
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground" prefetch={false}>
            Projects
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground" prefetch={false}>
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-9 w-9">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>JP</AvatarFallback>
                <span className="sr-only">Toggle user menu</span>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => router.push("/dashboard")}>My Account</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:px-6 lg:px-8">
        {processedData ? (
          <ProcessImage 
            processedData={processedData}
            onComplete={handleProcessingComplete}
          />
        ) : (
          <div className="max-w-md w-full space-y-4 text-center">
            <h1 className="text-3xl font-bold">Upload Image</h1>
            <p className="text-muted-foreground">Supported formats are JPEG, PNG, PDF</p>
            <div className="flex flex-col items-center space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".png,.jpg,.jpeg,.pdf"
                className="hidden"
              />
              <Button onClick={handleUploadClick}>
                Select File
              </Button>
              <Button
                className="w-full"
                disabled={!selectedFile || isLoading}
                onClick={handleDigitaliseClick}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                    Processing...
                  </div>
                ) : (
                  'Digitalise your text'
                )}
              </Button>
            </div>
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected file: {selectedFile.name}
              </p>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
        <UserHistory />
      </main>
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

const ExclamationTriangleIcon = ({ className = '', size = 24, color = 'currentColor' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  );
};