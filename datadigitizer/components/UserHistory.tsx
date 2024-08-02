import React, { useEffect, useState, useCallback } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Loader2 } from "lucide-react";
import { format } from 'date-fns';
import { useAuthStore } from '@/lib/authStore';

interface HistoryItem {
    id: string;
    originalFileName: string;
    processedAt: string;
    imageDownloadURL: string;
    csvDownloadURL: string;
}

export function UserHistory() {
  const { user, isLoading: authLoading, error: authError, getIdToken } = useAuthStore();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const itemsPerPage = 10;

  const fetchUserHistory = useCallback(async () => {
    if (!user) {
      setError('User not authenticated. Please log in.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = await getIdToken();
      if (!token) {
        throw new Error('Failed to get authentication token');
      }
      const response = await fetch(`http://localhost:3001/userHistory?page=${page}&limit=${itemsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user history');
      }
      const data = await response.json();
      setHistory(data.history);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
      setInitialFetchDone(true);
    }
  }, [user, getIdToken, page]);

  useEffect(() => {
    if (!authLoading && user && !initialFetchDone) {
      fetchUserHistory();
    }
  }, [authLoading, user, fetchUserHistory, initialFetchDone]);

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (authLoading || (!initialFetchDone && !error)) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (authError || error) {
    return (
      <Alert variant="destructive">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{authError || error}</AlertDescription>
      </Alert>
    );
  }

  if (!user) {
    return (
      <Alert>
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>Please log in to view your processing history.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Processing History</h2>
        <Button onClick={fetchUserHistory} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Refresh'}
        </Button>
      </div>
      
      {loading && history.length === 0 ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-gray-600">Loading history...</p>
        </div>
      ) : history.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">File Name</TableHead>
                <TableHead className="w-1/3">Processed Date</TableHead>
                <TableHead className="w-1/3">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.originalFileName}</TableCell>
                  <TableCell>{format(new Date(item.processedAt), 'PPP')}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleDownload(item.csvDownloadURL, item.originalFileName)}
                      size="sm"
                      variant="outline"
                    >
                      Download CSV
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-between mt-4">
            <Button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1 || loading}
              variant="outline"
            >
              Previous
            </Button>
            <Button 
              onClick={() => setPage(p => p + 1)} 
              disabled={history.length < itemsPerPage || loading}
              variant="outline"
            >
              Next
            </Button>
          </div>
        </>
      ) : (
        <p className="text-center py-8 text-gray-600">No processing history available.</p>
      )}
    </div>
  );
}