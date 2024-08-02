'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getFirestore, doc, getDoc, setDoc, updateDoc, DocumentData, onSnapshot } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { useAuthStore } from '@/lib/authStore';
import { toast } from 'react-toastify';
import Link from 'next/link';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const db = getFirestore();

// Type definitions
interface ProfileData {
  name: string;
  email: string;
  phone: string;
  organization: string;
}

interface SubscriptionData {
  plan: string;
  billingCycle: string;
  nextBillingDate: string;
  paymentMethod: string;
}

interface StatsData {
  totalDocuments: number;
  pagesDigitized: number;
  creditsRemaining: number;
}

export function Dashboard() {
  const { user, logout } = useAuthStore();
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    organization: '',
  });
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    plan: 'Free',
    billingCycle: 'N/A',
    nextBillingDate: 'N/A',
    paymentMethod: 'N/A',
  });
  const [stats, setStats] = useState<StatsData>({
    totalDocuments: 0,
    pagesDigitized: 0,
    creditsRemaining: 10,
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  const updateStateWithUserData = useCallback((userData: DocumentData) => {
    setProfileData({
      name: userData?.name || user?.displayName || user?.email || '',
      email: user?.email || '',
      phone: userData?.phone || '',
      organization: userData?.organization || '',
    });
    setSubscriptionData({
      plan: userData?.subscriptionPlan || 'Free',
      billingCycle: userData?.billingCycle || 'N/A',
      nextBillingDate: userData?.nextBillingDate || 'N/A',
      paymentMethod: userData?.paymentMethod || 'N/A',
    });
    setStats({
      totalDocuments: userData?.totalDocuments || 0,
      pagesDigitized: userData?.pagesDigitized || 0,
      creditsRemaining: userData?.creditsRemaining || 0,
    });
  }, [user]);

  const fetchUserData = useCallback(async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      let userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        const defaultUserData: DocumentData = {
          name: user.displayName || user.email,
          email: user.email,
          phone: '',
          organization: '',
          subscriptionPlan: 'Free',
          billingCycle: 'N/A',
          nextBillingDate: 'N/A',
          paymentMethod: 'N/A',
          totalDocuments: 0,
          pagesDigitized: 0,
          creditsRemaining: 10,
        };
        await setDoc(userDocRef, defaultUserData);
        userDocSnap = await getDoc(userDocRef);
      }

      const userData = userDocSnap.data() as DocumentData;
      updateStateWithUserData(userData);

      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const updatedUserData = doc.data() as DocumentData;
          updateStateWithUserData(updatedUserData);
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load user data. Please check your internet connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [user, updateStateWithUserData]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (user?.uid) {
      const setup = async () => {
        unsubscribe = await fetchUserData();
      };
      setup();
    } else {
      router.push('/');
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, router, fetchUserData]);

  const handleEditName = () => {
    setIsEditingName(true);
    setNewName(profileData.name);
  };

  const handleSaveName = async () => {
    if (!user?.uid || newName.trim() === '') return;

    setIsLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { name: newName.trim() });
      setProfileData(prevData => ({ ...prevData, name: newName.trim() }));
      setIsEditingName(false);
      toast.success("Your name has been updated successfully.");
    } catch (error) {
      console.error("Error saving name:", error);
      toast.error("Failed to save your name. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <SkeletonLoading />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header 
        user={user} 
        logout={logout} 
        avatarFallback={getAvatarFallback(profileData.email)} 
      />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <StatsCards stats={stats} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ProfileCard
            profileData={profileData}
            isEditingName={isEditingName}
            newName={newName}
            setNewName={setNewName}
            handleEditName={handleEditName}
            handleSaveName={handleSaveName}
            isLoading={isLoading}
          />
          <SubscriptionCard subscriptionData={subscriptionData} />
        </div>
      </main>
    </div>
  );
}

const getAvatarFallback = (email: string | undefined) => {
  return email && email.length > 0 ? email[0].toUpperCase() : '?';
};

const SkeletonLoading = () => (
  <div className="flex min-h-screen w-full flex-col bg-background">
    <div className="h-16 w-full bg-gray-200 mb-4"></div>
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton width={100} />
            </CardHeader>
            <CardContent>
              <Skeleton width={50} height={24} />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton width={150} />
          </CardHeader>
          <CardContent>
            <Skeleton count={4} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton width={150} />
          </CardHeader>
          <CardContent>
            <Skeleton count={4} />
          </CardContent>
        </Card>
      </div>
    </main>
  </div>
);

const Header = ({ user, logout, avatarFallback }: {
  user: User | null,
  logout: () => void,
  avatarFallback: string
}) => (
  <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background px-4 md:px-6">
    <Link href="#" className="flex items-center gap-2 text-lg font-semibold">
      <DatabaseIcon className="h-6 w-6 text-primary" />
      <span>Data Digitizer</span>
    </Link>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.photoURL || "/placeholder-user.jpg"} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <UserIcon className="mr-2 h-4 w-4" />
          <Link href="/uploadimage">New Project</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOutIcon className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </header>
);

const StatsCards = ({ stats }: { stats: StatsData }) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    <StatCard title="Total Documents" value={stats.totalDocuments} icon={<FileIcon className="h-4 w-4" />} bgColor="bg-primary" textColor="text-primary-foreground" />
    <StatCard title="Pages Digitized" value={stats.pagesDigitized} icon={<CopyIcon className="h-4 w-4" />} bgColor="bg-secondary" textColor="text-secondary-foreground" />
    <StatCard title="Credits Remaining" value={stats.creditsRemaining} icon={<BriefcaseIcon className="h-4 w-4" />} bgColor="bg-accent" textColor="text-accent-foreground" />
  </div>
);

const StatCard = ({ title, value, icon, bgColor, textColor }: { title: string, value: number, icon: React.ReactNode, bgColor: string, textColor: string }) => (
  <Card className={`${bgColor} ${textColor}`}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const ProfileCard = ({ profileData, isEditingName, newName, setNewName, handleEditName, handleSaveName, isLoading }: {
  profileData: ProfileData,
  isEditingName: boolean,
  newName: string,
  setNewName: (name: string) => void,
  handleEditName: () => void,
  handleSaveName: () => void,
  isLoading: boolean
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">Profile Information</CardTitle>
      {!isEditingName && (
        <Button variant="outline" size="sm" onClick={handleEditName}>
          Edit
        </Button>
      )}
    </CardHeader>
    <CardContent>
      <div className="grid gap-3">
        <ProfileField
          label="Name"
          value={profileData.name}
          isEditing={isEditingName}
          editComponent={
            <div className="flex items-center">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="mr-2"
              />
              <Button variant="outline" size="sm" onClick={handleSaveName} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          }
        />
        <ProfileField label="Email" value={profileData.email} />
        <ProfileField label="Phone" value={profileData.phone} />
        <ProfileField label="Organization" value={profileData.organization} />
      </div>
    </CardContent>
  </Card>
);

const ProfileField = ({ label, value, isEditing = false, editComponent = null }: {
  label: string,
  value: string,
  isEditing?: boolean,
  editComponent?: React.ReactNode
}) => (
  <div className="flex items-center justify-between">
    <div className="text-muted-foreground">{label}</div>
    {isEditing ? editComponent : <div>{value}</div>}
  </div>
);

const SubscriptionCard = ({ subscriptionData }: { subscriptionData: SubscriptionData }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">Subscription Details</CardTitle>
      <Button variant="outline" size="sm">
        Manage
      </Button>
    </CardHeader>
    <CardContent>
      <div className="grid gap-3">
        <ProfileField label="Plan" value={subscriptionData.plan} />
        <ProfileField label="Billing Cycle" value={subscriptionData.billingCycle} />
        <ProfileField label="Next Billing Date" value={subscriptionData.nextBillingDate} />
        <ProfileField label="Payment Method" value={subscriptionData.paymentMethod} />
      </div>
    </CardContent>
  </Card>
);

// Icon components (unchanged)
// ... (Include all the icon components here)
interface IconProps {
  className?: string;
  [key: string]: any;
}

function BriefcaseIcon(props: IconProps) {
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
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  )
}

function CopyIcon(props: IconProps) {
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
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}

function DatabaseIcon(props: IconProps) {
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

function FileIcon(props: IconProps) {
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
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  )
}

function LogOutIcon(props: IconProps) {
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
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  )
}

function SettingsIcon(props: IconProps) {
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
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function UserIcon(props: IconProps) {
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
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
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