import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="p-10 text-center">
      <h1 className="text-5xl font-bold">
        Obrigado!
      </h1>

      <p className="mt-4">
        A sua encomenda foi recebida.
      </p>

      <Link
        href="/"
        className="mt-8 inline-block rounded bg-black px-6 py-3 text-white"
      >
        Voltar à Loja
      </Link>
    </div>
  );
}