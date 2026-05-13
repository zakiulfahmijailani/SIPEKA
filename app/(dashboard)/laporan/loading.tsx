import { TableSkeleton } from "@/components/skeletons"

export default function LaporanLoading() {
  return <TableSkeleton cols={5} rows={6} showHeader={true} />
}
