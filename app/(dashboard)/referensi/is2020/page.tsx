import { MOCK_SESSION } from "@/lib/mock-session"
import { db } from "@/db"
import { is2020Realm } from "@/db/schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { asc } from "drizzle-orm"


export const dynamic = "force-dynamic"
export default async function ReferensiIS2020Page() {
  const session = MOCK_SESSION

  // Fetch Realms with their Areas
  const realms = await db.query.is2020Realm.findMany({
    orderBy: [asc(is2020Realm.urutan)],
    with: {
      areas: {
        orderBy: (areas, { asc }) => [asc(areas.urutan)],
      }
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Referensi IS2020</h1>
        <p className="text-muted-foreground">
          Daftar Realm dan Knowledge Area berdasarkan standar ACM/AIS IS2020
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {realms.map((realm) => (
          <Card key={realm.id} className="flex flex-col h-full border-t-4 border-t-blue-600">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{realm.nama}</CardTitle>
                  <p className="text-sm font-semibold text-blue-600 mt-1">{realm.kode}</p>
                </div>
              </div>
              {realm.deskripsi && (
                <CardDescription className="mt-2">{realm.deskripsi}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex-1 bg-slate-50/50 pt-4 m-1 rounded-md">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Knowledge Areas</h4>
                <div className="space-y-3">
                  {realm.areas.map((area) => (
                    <div key={area.id} className="bg-white p-3 rounded-md border shadow-sm flex flex-col gap-2">
                      <div className="flex justify-between items-start gap-2">
                        <div className="font-semibold text-sm leading-tight">
                          {area.nama} <span className="text-muted-foreground font-normal text-xs ml-1">({area.kode})</span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={area.status === "REQUIRED" 
                            ? "bg-red-50 text-red-700 border-red-200 text-[10px] uppercase shrink-0" 
                            : "bg-gray-50 text-gray-600 border-gray-200 text-[10px] uppercase shrink-0"
                          }
                        >
                          {area.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {area.deskripsi}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
