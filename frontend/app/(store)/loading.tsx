export default function StoreLoading() {
    return (
        <div className="min-h-[70vh] bg-[#F8F9F5] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <div className="mx-auto max-w-7xl" role="status" aria-label="A carregar conteúdo">
                <div className="h-3 w-28 animate-pulse rounded-full bg-[#DDE4D7]" />
                <div className="mt-5 h-10 w-full max-w-lg animate-pulse rounded-2xl bg-[#E7ECE2]" />
                <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded-full bg-[#EEF1EB]" />
                <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }, (_, index) => (
                        <div key={index} className="overflow-hidden rounded-[1.75rem] border border-[#E7EBE2] bg-white">
                            <div className="aspect-[4/3] animate-pulse bg-[#E8ECE4]" />
                            <div className="space-y-3 p-5">
                                <div className="h-4 w-2/3 animate-pulse rounded bg-[#E7EBE2]" />
                                <div className="h-3 w-1/2 animate-pulse rounded bg-[#EEF1EB]" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
