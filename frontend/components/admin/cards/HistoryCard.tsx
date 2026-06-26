import SectionCard from "@/components/admin/common/SectionCard";

type HistoryEvent = {
    title: string;
    date: string;
};

type Props = {
    events: HistoryEvent[];
};

export default function HistoryCard({
    events,
}: Props) {
    return (
        <SectionCard title="Histórico">

            <div className="space-y-5">

                {events.map(
                    (event, index) => (

                        <div
                            key={index}
                            className="flex gap-3"
                        >

                            <div
                                className="
                                    mt-2
                                    h-2
                                    w-2
                                    rounded-full
                                    bg-green-500
                                "
                            />

                            <div>

                                <p className="font-medium">
                                    {event.title}
                                </p>

                                <p className="text-sm text-gray-500">
                                    {event.date}
                                </p>

                            </div>

                        </div>

                    )
                )}

            </div>

        </SectionCard>
    );
}