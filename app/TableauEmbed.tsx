
'use client'
export default function TableauEmbed() {
  const tableauUrl = process.env.NEXT_PUBLIC_TABLEAU_URL;

  if (!tableauUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <div className="text-center">
          <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Tableau URL is not configured.
          </h1>
          <p className="mt-4 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Please set the NEXT_PUBLIC_TABLEAU_URL environment variable.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="grow">
        <iframe
          src={tableauUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
        />
      </div>
      <div className="p-4 flex flex-col items-center bg-zinc-50 dark:bg-black">
        <p className="mb-4 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          “Insights don’t just sit there — they trigger action.”
        </p>
        <button
          onClick={async () => {
            await fetch("/api/alert", { method: "POST" });
            alert("Slack alert sent!");
          }}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-auto"
        >
          Trigger Alert / Create Task
        </button>
      </div>
    </div>
  );
}
