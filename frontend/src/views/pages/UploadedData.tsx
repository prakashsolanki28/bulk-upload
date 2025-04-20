import * as React from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ChevronLeft, ChevronRight, Loader, RefreshCcw } from "lucide-react"
import { Link } from "react-router-dom"

type User = {
    id: number
    name: string
    age: number
    country: string
    subscription_Type: string
    watch_time_hours: number
    favorite_genre: string
    last_login: string
    createdAt: string
    updatedAt: string
}

const columns: ColumnDef<User>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Name <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
    },
    { accessorKey: "age", header: "Age" },
    { accessorKey: "country", header: "Country" },
    { accessorKey: "subscription_Type", header: "Subscription" },
    { accessorKey: "watch_time_hours", header: "Watch Time (hrs)" },
    { accessorKey: "favorite_genre", header: "Favorite Genre" },
    {
        accessorKey: "last_login",
        header: "Last Login",
        cell: ({ row }) => {
            const formatted = new Date(row.getValue("last_login")).toLocaleDateString()
            return <div>{formatted}</div>
        },
    },
]

export default function UploadedData() {
    const [data, setData] = React.useState<User[]>([])
    const [loading, setLoading] = React.useState(false)
    const [globalFilter, setGlobalFilter] = React.useState("")
    const [page, setPage] = React.useState(1)
    const [limit, setLimit] = React.useState(10)
    const [totalPages, setTotalPages] = React.useState(1)

    const fetchData = React.useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch(`https://api-bulkdata.prakashsolanki.tech/api/users?page=${page}&limit=${limit}&search=${globalFilter}`);
            const json = await res.json()
            setData(json.users || [])
            setTotalPages(json.pagination.totalPages || 1)
        } catch (err) {
            console.error("Failed to fetch users", err)
        } finally {
            setLoading(false)
        }
    }, [limit, page, globalFilter]);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            fetchData()
        }, 1000)
        return () => clearTimeout(timer);
    }, [fetchData])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLimit(Number(e.target.value))
        setPage(1)
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="container mx-auto px-4 py-10">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>User Data</CardTitle>
                                <CardDescription>
                                    List of uploaded user details from CSV
                                </CardDescription>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={fetchData}
                                    disabled={loading}
                                >
                                    <RefreshCcw className="h-4 w-4" />
                                </Button>
                                <Link to={'/'}>
                                    <Button variant="outline">
                                        Upload More Data
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Input
                                placeholder="Search..."
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                className="max-w-sm"
                            />
                            <div className="flex items-center space-x-2">
                                <label htmlFor="pageSize" className="text-sm">
                                    Show:
                                </label>
                                <select
                                    id="pageSize"
                                    value={limit}
                                    onChange={handleLimitChange}
                                    className="rounded border px-2 py-1 text-sm"
                                >
                                    {[10, 25, 50, 100, 500, 1000].map((size) => (
                                        <option key={size} value={size}>
                                            {size}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <TableHead key={header.id}>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(header.column.columnDef.header, header.getContext())}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={columns.length}>
                                                <div className="flex items-center justify-center space-x-2">
                                                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                                                    Loading...
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : data.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow key={row.id}>
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={columns.length}>No results.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Previous
                            </Button>
                            <span className="text-sm">
                                Page {page} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                            >
                                Next
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}