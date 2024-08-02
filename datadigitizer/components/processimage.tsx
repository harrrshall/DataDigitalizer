import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { UserHistory } from './UserHistory';

interface ProcessedData {
  docId: string;
  preview: Record<string, string>[];
  csvUrl: string;
  newCredits: number;
  newTotalDocuments: number;
  newPagesDigitized: number;
}

interface ProcessImageProps {
  processedData: ProcessedData;
  onComplete: () => void;
}

export function ProcessImage({ processedData, onComplete }: ProcessImageProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!processedData || !processedData.preview || processedData.preview.length === 0) {
      setError("No data available to display.");
    } else {
      setError(null);
    }
  }, [processedData]);

  const handleProcessAnother = () => {
    onComplete();
  };

  const handleDownloadCSV = () => {
    if (processedData.csvUrl) {
      window.open(processedData.csvUrl, '_blank');
    } else {
      setError("CSV download link is not available.");
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">Processed Results</h1>
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-2">Preview</h2>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-[300px] sm:max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(processedData.preview[0]).map((header) => (
                        <TableHead key={header} className="px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm whitespace-nowrap">
                          {header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedData.preview.map((item, index) => (
                      <TableRow key={index}>
                        {Object.values(item).map((value, i) => (
                          <TableCell key={i} className="px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm">
                            {value}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
            <Button onClick={handleProcessAnother} className="w-full sm:w-auto">
              Process Another Image
            </Button>
            <Button onClick={handleDownloadCSV} className="w-full sm:w-auto">
              Download CSV
            </Button>
          </div>
          
          <UserHistory />
        </div>
      </main>
    </div>
  );
}

interface IconProps {
  className?: string;
  [key: string]: any;
}

function Package2Icon(props: IconProps) {
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
      <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
      <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
      <path d="M12 3v6" />
    </svg>
  );
}
