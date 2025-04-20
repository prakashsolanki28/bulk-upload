import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader } from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

const App: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<
        "idle" | "uploading" | "success" | "error"
    >("idle");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setUploadStatus("idle");
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setUploadStatus("idle");
        }
    };

    const handleUpload = () => {
        if (!file) return;
        setUploadStatus("uploading");

        const formData = new FormData();
        formData.append("file", file);

        fetch("https://api-bulkdata.prakashsolanki.tech/api/users/upload-users", {
            method: "POST",
            body: formData,
        }).then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        }).then((data) => {
            setUploadStatus("success");
            console.log("Upload successful:", data);
            navigate('/data');
        }).catch((error) => {
            console.error("Upload failed:", error);
            setUploadStatus("error");
        });
    };

    const handleBrowseClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="container mx-auto px-4 py-16">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>
                                    Upload Your File
                                </CardTitle>
                                <CardDescription>
                                    Drag and drop your CSV file or click to browse
                                </CardDescription>
                            </div>
                            <Link to="/data">
                                <Button variant={'outline'} className="!rounded-button whitespace-nowrap">
                                    Uploaded Data
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={handleBrowseClick}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".csv"
                                className="hidden"
                            />
                            {!file ? (
                                <div>
                                    <i className="fas fa-file-csv text-6xl text-gray-400 mb-4"></i>
                                    <p className="text-lg text-gray-600 mb-2">
                                        Drag and drop your CSV file here
                                    </p>
                                    <p className="text-sm text-gray-500">or</p>
                                    <Button className="mt-4 !rounded-button whitespace-nowrap">
                                        <i className="fas fa-folder-open mr-2"></i> Browse Files
                                    </Button>
                                </div>
                            ) : (
                                <div>
                                    <i className="fas fa-file-csv text-6xl text-green-500 mb-4"></i>
                                    <p className="text-lg font-medium text-gray-800 mb-2">
                                        {file.name}
                                    </p>
                                    <p className="text-sm text-gray-500 mb-4">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>

                                    {uploadStatus === "idle" && (
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleUpload();
                                            }}
                                            className="!rounded-button whitespace-nowrap"
                                        >
                                            <i className="fas fa-upload mr-2"></i> Start Upload
                                        </Button>
                                    )}

                                    {uploadStatus === "uploading" && (
                                        <div className="space-y-2 flex gap-3 flex-col items-center">
                                            <p className="text-sm text-gray-600">
                                                <Loader className="animate-spin text-blue-500 h-6 w-6 mx-auto" />
                                                Uploading...
                                            </p>
                                        </div>
                                    )}

                                    {uploadStatus === "success" && (
                                        <Alert className="bg-green-50 border-green-200">
                                            <i className="fas fa-check-circle text-green-500 mr-2"></i>
                                            <AlertTitle>Upload Complete!</AlertTitle>
                                            <AlertDescription>
                                                Your file has been uploaded and is now being
                                                processed.
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {uploadStatus === "error" && (
                                        <Alert className="bg-red-50 border-red-200">
                                            <i className="fas fa-exclamation-circle text-red-500 mr-2"></i>
                                            <AlertTitle>Upload Failed</AlertTitle>
                                            <AlertDescription>
                                                There was an error uploading your file. Please try
                                                again.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mt-4 text-sm text-gray-500">
                            <p>
                                <i className="fas fa-info-circle mr-1"></i> Supported format:
                                CSV
                            </p>
                            <p>
                                <i className="fas fa-exclamation-triangle mr-1"></i> Maximum
                                file size: 100MB
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className="text-sm text-gray-500 w-full">
                            <p>
                                <i className="fas fa-file-alt mr-1"></i> Example CSV format:(
                                <a
                                    href="/netflix_users.csv"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 underline"
                                    download
                                >
                                    Download Sample CSV
                                </a>
                                )
                            </p>
                            <pre className="bg-gray-50 p-2 rounded-md">
                                {`User_ID,Name,Age,Country,Subscription_Type,Watch_Time_Hours,Favorite_Genre,Last_Login
1,James Martinez,18,France,Premium,80.26,Drama,2024-05-12
2,John Miller,23,USA,Premium,321.75,Sci-Fi,2025-02-05
3,Emma Davis,60,UK,Basic,35.89,Comedy,2025-01-24`}
                            </pre>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default App;