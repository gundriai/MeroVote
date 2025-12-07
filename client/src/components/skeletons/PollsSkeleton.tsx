
import { Skeleton } from "@/components/ui/skeleton";

export function PollsSkeleton() {
    return (
        <div className="w-full flex flex-wrap -mx-3">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-full md:w-1/2 px-3 mb-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
                        {/* Header Skeleton */}
                        <div className="p-4 border-b border-gray-50 flex justify-between items-start">
                            <div className="flex items-center space-x-3">
                                <Skeleton className="w-10 h-10 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>

                        {/* Content Skeleton */}
                        <div className="p-6 space-y-4 flex-grow">
                            <Skeleton className="h-6 w-3/4" />
                            <div className="space-y-3 pt-2">
                                <Skeleton className="h-12 w-full rounded-lg" />
                                <Skeleton className="h-12 w-full rounded-lg" />
                            </div>
                        </div>

                        {/* Footer Skeleton */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                            <Skeleton className="h-4 w-24" />
                            <div className="flex space-x-2">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
