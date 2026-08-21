"use client";

import {
    useState,
} from "react";

import {
    AlertCircle,
    Check,
    CheckCircle2,
    Eye,
    EyeOff,
    KeyRound,
    Lock,
    Save,
} from "lucide-react";

import PageHeader from "@/components/admin/common/PageHeader";

import {
    changePassword,
} from "@/lib/api/users";

export default function AccountSecurityPage() {
    const [
        currentPassword,
        setCurrentPassword,
    ] = useState("");

    const [
        newPassword,
        setNewPassword,
    ] = useState("");

    const [
        confirmPassword,
        setConfirmPassword,
    ] = useState("");

    const [
        showCurrentPassword,
        setShowCurrentPassword,
    ] = useState(false);

    const [
        showNewPassword,
        setShowNewPassword,
    ] = useState(false);

    const [
        showConfirmPassword,
        setShowConfirmPassword,
    ] = useState(false);

    const [
        isSaving,
        setIsSaving,
    ] = useState(false);

    const [
        successMessage,
        setSuccessMessage,
    ] = useState<string | null>(null);

    const [
        errorMessage,
        setErrorMessage,
    ] = useState<string | null>(null);

    /* ====================================================================== */
    /* PASSWORD RULES                                                          */
    /* ====================================================================== */

    const hasMinLength =
        newPassword.length >= 8;

    const passwordsMatch =
        newPassword.length > 0 &&
        newPassword === confirmPassword;

    const hasUppercase =
        /[A-Z]/.test(newPassword);

    const hasLowercase =
        /[a-z]/.test(newPassword);

    const hasNumber =
        /[0-9]/.test(newPassword);

    /* ====================================================================== */
    /* SUBMIT                                                                  */
    /* ====================================================================== */

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setSuccessMessage(null);
        setErrorMessage(null);

        if (!currentPassword) {
            setErrorMessage(
                "Introduza a sua password atual.",
            );

            return;
        }

        if (!newPassword) {
            setErrorMessage(
                "Introduza uma nova password.",
            );

            return;
        }

        if (!hasMinLength) {
            setErrorMessage(
                "A nova password deve ter pelo menos 8 caracteres.",
            );

            return;
        }

        if (
            newPassword !==
            confirmPassword
        ) {
            setErrorMessage(
                "As passwords não coincidem.",
            );

            return;
        }

        if (
            newPassword ===
            currentPassword
        ) {
            setErrorMessage(
                "A nova password deve ser diferente da password atual.",
            );

            return;
        }

        try {
            setIsSaving(true);

            await changePassword({
                currentPassword,
                newPassword,
            });

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            setSuccessMessage(
                "A sua password foi alterada com sucesso.",
            );
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Não foi possível alterar a sua password.",
            );
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="space-y-8 pb-10">

            {/* ================================================================== */}
            {/* HEADER                                                             */}
            {/* ================================================================== */}

            <PageHeader
                title="Segurança"
                subtitle="Gerir a password e a segurança da sua conta."
            />

            {/* ================================================================== */}
            {/* SECURITY SUMMARY                                                   */}
            {/* ================================================================== */}

            <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">

                <div className="flex items-center gap-4">

                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F5F7F2] text-[#55624A]">

                        <Lock size={25} />

                    </div>

                    <div>

                        <h2 className="text-xl font-bold text-[#2F3B2A]">
                            Segurança da conta
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Mantenha a sua password segura e atualizada.
                        </p>

                    </div>

                </div>

            </div>

            {/* ================================================================== */}
            {/* PASSWORD FORM                                                      */}
            {/* ================================================================== */}

            <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">

                <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5F7F2] text-[#55624A]">

                        <KeyRound size={20} />

                    </div>

                    <div>

                        <h2 className="text-xl font-bold text-[#2F3B2A]">
                            Alterar password
                        </h2>

                        <p className="mt-1 text-sm text-gray-400">
                            Escolha uma password forte que não utilize noutras contas.
                        </p>

                    </div>

                </div>

                <form
                    onSubmit={handleSubmit}
                    className="mt-8 max-w-2xl space-y-6"
                >

                    {/* ========================================================== */}
                    {/* CURRENT PASSWORD                                             */}
                    {/* ========================================================== */}

                    <PasswordField
                        label="Password atual"
                        value={currentPassword}
                        onChange={setCurrentPassword}
                        visible={showCurrentPassword}
                        onToggle={() =>
                            setShowCurrentPassword(
                                (current) => !current,
                            )
                        }
                        disabled={isSaving}
                        autoComplete="current-password"
                    />

                    {/* ========================================================== */}
                    {/* NEW PASSWORD                                                 */}
                    {/* ========================================================== */}

                    <PasswordField
                        label="Nova password"
                        value={newPassword}
                        onChange={setNewPassword}
                        visible={showNewPassword}
                        onToggle={() =>
                            setShowNewPassword(
                                (current) => !current,
                            )
                        }
                        disabled={isSaving}
                        autoComplete="new-password"
                    />

                    {/* ========================================================== */}
                    {/* PASSWORD REQUIREMENTS                                         */}
                    {/* ========================================================== */}

                    <div className="rounded-2xl bg-[#F8F9F6] p-5">

                        <p className="text-sm font-semibold text-[#2F3B2A]">
                            Requisitos da password
                        </p>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">

                            <PasswordRequirement
                                valid={hasMinLength}
                                label="Pelo menos 8 caracteres"
                            />

                            <PasswordRequirement
                                valid={hasUppercase}
                                label="Uma letra maiúscula"
                            />

                            <PasswordRequirement
                                valid={hasLowercase}
                                label="Uma letra minúscula"
                            />

                            <PasswordRequirement
                                valid={hasNumber}
                                label="Um número"
                            />

                        </div>

                    </div>

                    {/* ========================================================== */}
                    {/* CONFIRM PASSWORD                                             */}
                    {/* ========================================================== */}

                    <PasswordField
                        label="Confirmar nova password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        visible={showConfirmPassword}
                        onToggle={() =>
                            setShowConfirmPassword(
                                (current) => !current,
                            )
                        }
                        disabled={isSaving}
                        autoComplete="new-password"
                    />

                    {confirmPassword &&
                        !passwordsMatch && (
                            <p className="-mt-3 text-sm text-red-600">
                                As passwords não coincidem.
                            </p>
                        )}

                    {confirmPassword &&
                        passwordsMatch && (
                            <p className="-mt-3 flex items-center gap-1.5 text-sm text-green-600">
                                <Check size={15} />
                                As passwords coincidem.
                            </p>
                        )}

                    {/* ========================================================== */}
                    {/* FEEDBACK                                                     */}
                    {/* ========================================================== */}

                    {successMessage && (
                        <div className="flex items-start gap-3 rounded-2xl border border-green-100 bg-green-50 p-4">

                            <CheckCircle2
                                size={19}
                                className="mt-0.5 shrink-0 text-green-600"
                            />

                            <div>

                                <p className="text-sm font-semibold text-green-700">
                                    Password alterada
                                </p>

                                <p className="mt-0.5 text-sm text-green-600">
                                    {successMessage}
                                </p>

                            </div>

                        </div>
                    )}

                    {errorMessage && (
                        <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">

                            <AlertCircle
                                size={19}
                                className="mt-0.5 shrink-0 text-red-600"
                            />

                            <div>

                                <p className="text-sm font-semibold text-red-700">
                                    Não foi possível alterar a password
                                </p>

                                <p className="mt-0.5 text-sm text-red-600">
                                    {errorMessage}
                                </p>

                            </div>

                        </div>
                    )}

                    {/* ========================================================== */}
                    {/* ACTION                                                       */}
                    {/* ========================================================== */}

                    <div className="flex justify-end border-t border-gray-100 pt-6">

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                rounded-2xl
                                bg-[#55624A]
                                px-6
                                py-3
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:bg-[#46523C]
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >

                            <Save size={17} />

                            {isSaving
                                ? "A guardar..."
                                : "Alterar password"}

                        </button>

                    </div>

                </form>

            </div>

            {/* ================================================================== */}
            {/* SECURITY TIP                                                       */}
            {/* ================================================================== */}

            <div className="rounded-3xl border border-[#D6DEC8] bg-[#F5F7F2] p-6">

                <div className="flex gap-4">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D6DEC8] text-[#55624A]">

                        <Lock size={18} />

                    </div>

                    <div>

                        <h3 className="font-semibold text-[#2F3B2A]">
                            Dica de segurança
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-gray-600">
                            Nunca partilhe a sua password.
                            Utilize uma password única e evite
                            informações fáceis de adivinhar.
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}

/* ========================================================================== */
/* PASSWORD FIELD                                                             */
/* ========================================================================== */

function PasswordField({
    label,
    value,
    onChange,
    visible,
    onToggle,
    disabled,
    autoComplete,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    visible: boolean;
    onToggle: () => void;
    disabled: boolean;
    autoComplete: string;
}) {
    return (
        <div>

            <label className="block text-sm font-semibold text-[#2F3B2A]">
                {label}
            </label>

            <div className="relative mt-2">

                <input
                    type={
                        visible
                            ? "text"
                            : "password"
                    }
                    value={value}
                    onChange={(event) =>
                        onChange(
                            event.target.value,
                        )
                    }
                    disabled={disabled}
                    autoComplete={autoComplete}
                    className="
                        w-full
                        rounded-2xl
                        border
                        border-gray-200
                        bg-white
                        py-3
                        pl-4
                        pr-12
                        text-sm
                        text-gray-700
                        outline-none
                        transition
                        focus:border-[#55624A]
                        focus:ring-4
                        focus:ring-[#55624A]/10
                        disabled:cursor-not-allowed
                        disabled:bg-gray-50
                    "
                />

                <button
                    type="button"
                    onClick={onToggle}
                    disabled={disabled}
                    aria-label={
                        visible
                            ? "Ocultar password"
                            : "Mostrar password"
                    }
                    className="
                        absolute
                        right-3
                        top-1/2
                        flex
                        h-9
                        w-9
                        -translate-y-1/2
                        items-center
                        justify-center
                        rounded-xl
                        text-gray-400
                        transition
                        hover:bg-gray-100
                        hover:text-[#55624A]
                        disabled:cursor-not-allowed
                    "
                >

                    {visible ? (
                        <EyeOff size={18} />
                    ) : (
                        <Eye size={18} />
                    )}

                </button>

            </div>

        </div>
    );
}

/* ========================================================================== */
/* PASSWORD REQUIREMENT                                                       */
/* ========================================================================== */

function PasswordRequirement({
    valid,
    label,
}: {
    valid: boolean;
    label: string;
}) {
    return (
        <div className="flex items-center gap-2">

            <div
                className={`
                    flex
                    h-5
                    w-5
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    ${
                        valid
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-200 text-gray-400"
                    }
                `}
            >

                {valid ? (
                    <Check size={12} />
                ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                )}

            </div>

            <span
                className={`
                    text-xs
                    ${
                        valid
                            ? "text-green-700"
                            : "text-gray-500"
                    }
                `}
            >
                {label}
            </span>

        </div>
    );
}