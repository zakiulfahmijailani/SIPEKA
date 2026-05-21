export default async function PengaturanPage() {
  const PengaturanClient = (await import("./pengaturan-client")).default

  return <PengaturanClient initialSettings={[]} />
}
