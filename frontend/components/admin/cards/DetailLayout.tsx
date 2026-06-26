type Props = {
    children: React.ReactNode;
};

export default function DetailLayout({
    children,
}: Props) {
    return (
        <div className="space-y-8 pb-10">
            {children}
        </div>
    );
}