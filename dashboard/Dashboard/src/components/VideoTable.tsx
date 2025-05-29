'use client';

import React from 'react';
// import { Button } from '@/components/ui/button';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from '@/components/ui/dialog';
// import { TableComponent } from './TableComponent';
// // import { useProxyMutation } from '@/hooks/useQuery';
// import { Video } from '@/types/user';
// // import { toast } from 'sonner';
// import { Spinner } from './Loading';

const VideoTable = () => {
  // const [videoUrl, setVideoUrl] = useState<string | null>(null);
  // const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  // const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  // const [isDialogOpen, setIsDialogOpen] = useState(false);
  // const [loading, setLoading] = useState(true);
  // const [videoData, setVideoData] = useState<Video[]>([]);

  // const videoMutation = useProxyMutation<Blob, unknown>({
  //   path: `/video/file/${selectedVideo?.id}`,
  //   method: 'get',
  //   successMessage: 'Video loaded successfully',
  //   errorMessage: 'Failed to load video',
  //   responseType: 'blob',
  //   mutationOptions: {
  //     onSuccess: (blob: Blob) => {
  //       const url = URL.createObjectURL(blob);
  //       setVideoBlob(blob);
  //       setVideoUrl(url);
  //       setIsDialogOpen(true);
  //     },
  //     onError: error => {
  //       console.error('Error loading video:', error);
  //       toast.error('Error loading video');
  //     },
  //   },
  // });

  // const getAllVideo = useProxyMutation<Video[], unknown>({
  //   path: `/video/get-all`,
  //   method: 'get',
  //   successMessage: 'Video loaded successfully',
  //   errorMessage: 'Failed to load video',
  //   responseType: 'json',
  //   mutationOptions: {
  //     onSuccess: (data: Video[]) => {
  //       console.log('data', data);
  //       setVideoData(data);
  //     },
  //     onSettled: () => {
  //       setLoading(false);
  //     },
  //   },
  // });

  // const handleLoadVideo = (video: Video) => {
  //   setSelectedVideo(video);
  //   // console.log('video', video);
  //   setVideoUrl(null);
  //   videoMutation.mutate({});
  // };

  // const handleDownload = () => {
  //   if (!videoBlob || !videoUrl) return;
  //   const a = document.createElement('a');
  //   a.href = videoUrl;
  //   a.download = selectedVideo?.fileName || 'video.mp4';
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  // };

  // useEffect(() => {
  //   return () => {
  //     if (videoUrl) URL.revokeObjectURL(videoUrl);
  //   };
  // }, [videoUrl]);

  // const columns = [
  //   { header: 'ID', accessorKey: 'id' },
  //   { header: 'Client ID', accessorKey: 'clientId' },
  //   { header: 'Date', accessorKey: 'date' },
  //   { header: 'File Name', accessorKey: 'fileName' },
  //   {
  //     header: 'File Path',
  //     accessorKey: 'filePath',
  //     cell: (row: Video) => <span className="truncate">{row.filePath}</span>,
  //   },
  //   { header: 'Uploaded At', accessorKey: 'uploadedAt' },
  //   {
  //     header: 'Actions',
  //     accessorKey: 'actions',
  //     cell: (row: Video) => (
  //       <div className="flex gap-2 flex-wrap">
  //         <Button
  //           onClick={() => handleLoadVideo(row)}
  //           disabled={videoMutation.isPending && selectedVideo?.id === row.id}
  //         >
  //           {videoMutation.isPending && selectedVideo?.id === row.id ? 'Loading...' : 'Load Video'}
  //         </Button>
  //         {selectedVideo?.id === row.id && videoUrl && (
  //           <Button onClick={handleDownload} variant="outline">
  //             Download
  //           </Button>
  //         )}
  //       </div>
  //     ),
  //   },
  // ];

  // useEffect(() => {
  //   getAllVideo.mutate({});
  // }, []);

  // if (loading) return <Spinner show={loading} size="small" />;
  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-4">📹 Video Management</h2>
      {/* <TableComponent data={videoData} columns={columns} caption="" /> */}

      {/* <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>🎬 {selectedVideo?.fileName}</DialogTitle>
          </DialogHeader>
          {videoUrl && <video controls src={videoUrl} className="w-full rounded-md" autoPlay />}
          <DialogFooter className="mt-4">
            <Button onClick={handleDownload} variant="outline">
              Download
            </Button>
            <Button onClick={() => setIsDialogOpen(false)} variant="secondary">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </div>
  );
};

export default VideoTable;
