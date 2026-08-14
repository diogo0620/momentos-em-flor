import {
    Package,
} from "lucide-react";

export default function AccountOrdersPage() {
    return (
        <div className="rounded-3xl bg-white p-10 shadow-sm">

            <div className="flex flex-col items-center text-center">

                <div
                    className="
                        flex
                        h-16
                        w-16
                        items-center
                        justify-center
                        rounded-full
                        bg-[#F5F7F2]
                        text-[#55624A]
                    "
                >
                    <Package size={28} />
                </div>

                <h2 className="mt-5 text-2xl font-bold text-[#2F3B2A]">
                    As minhas encomendas
                </h2>

                <p className="mt-2 max-w-md text-gray-500">
                    Aqui poderá consultar o histórico,
                    estado e detalhes das suas encomendas.
                </p>

                <p className="mt-6 rounded-full bg-[#F5F7F2] px-4 py-2 text-sm text-gray-500">
                    Histórico de encomendas em breve
                </p>

            </div>

        </div>
    );
}