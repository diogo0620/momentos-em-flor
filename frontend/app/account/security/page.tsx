import { Lock } from "lucide-react";

import ChangePasswordForm from "@/components/account/ChangePasswordForm";

export default function AccountSecurityPage() {
    return (
        <div>

            <div className="rounded-3xl bg-white p-7 shadow-sm">

                <div className="flex items-center gap-4">

                    <div
                        className="
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-full
                            bg-[#D6DEC8]
                            text-[#55624A]
                        "
                    >
                        <Lock size={22} />
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-[#2F3B2A]">
                            Segurança
                        </h2>

                        <p className="text-sm text-gray-400">
                            Altere a password da sua conta.
                        </p>
                    </div>

                </div>

                <div className="mt-6 max-w-xl">
                    <ChangePasswordForm />
                </div>

            </div>

        </div>
    );
}