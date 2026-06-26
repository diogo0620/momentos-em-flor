import SectionCard from "@/components/admin/common/SectionCard";

type Props = {
    title?: string;
    src: string;
    alt: string;
};

export default function ImageCard({
    title = "Imagem",
    src,
    alt,
}: Props) {
    return (
        <SectionCard title={title}>

            <div className="flex flex-col items-center">

                <div
                    className="
                        flex
                        h-72
                        w-full
                        items-center
                        justify-center
                        rounded-3xl
                        bg-[#FAFAF7]
                    "
                >

                    <img
                        src={src}
                        alt={alt}
                        className="
                            max-h-64
                            object-contain
                        "
                    />

                </div>

            </div>

        </SectionCard>
    );
}