export default function LegalNotice() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <svg className="mt-0.5 size-4 shrink-0" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 5Zm0 6.5a.875.875 0 1 1 0-1.75.875.875 0 0 1 0 1.75Z" />
      </svg>
      <p>
        Utilisez cet outil uniquement pour des usages légitimes : audit, inspiration, développement
        ou assets dont vous avez les droits. Respectez les droits d&apos;auteur et les licences des
        contenus extraits.
      </p>
    </div>
  )
}
