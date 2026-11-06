"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadButton } from "@/lib/upload";

export function UploadDemo() {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Demo Upload Gambar</CardTitle>
        <CardDescription>
          Unggah gambar untuk digunakan pada website desa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              console.log("Files: ", res);
              alert("Upload Completed");
            }}
            onUploadError={(error: Error) => {
              alert(`ERROR! ${error.message}`);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}