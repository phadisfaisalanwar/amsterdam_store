import { useEffect, useState } from "react"

import { Navigate, Link } from "react-router"

import { useAuth } from "../context/AuthContext"

import { formatPrice } from "../data/products"

import { apiRequest } from "../data/api"

interface Order {
  orderId: string

  date: string

  status: "pending" | "processing" | "shipped" | "completed" | "cancelled"

  items: {
    productId: number
    name: string
    color: string
    quantity: number
    price: number
  }[]

  total: number

  shippingCost: number

  tracking: string

  courier: string

  customerConfirmed: boolean
}

interface ReturnRequest {
  id: string

  orderId: string

  type: "refund" | "exchange"

  product: string

  quantity: number

  reason: string

  status: string

  date: string
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("Bukti gambar tidak dapat dibaca"))

    reader.onerror = () => reject(new Error("Bukti gambar tidak dapat dibaca"))

    reader.readAsDataURL(file)
  })
}

const statusColor: Record<string, { bg: string text: string }> = {
  pending: { bg: "#fef3c7", text: "#92400e" },

  processing: { bg: "#dbeafe", text: "#1e40af" },

  shipped: { bg: "#e0f2fe", text: "#0369a1" },

  completed: { bg: "#dcfce7", text: "#166534" },

  cancelled: { bg: "#fee2e2", text: "#991b1b" },
}

const statusLabel: Record<Order["status"], string> = {
  pending: "Menunggu",

  processing: "Diproses",

  shipped: "Dikirim",

  completed: "Selesai",

  cancelled: "Dibatalkan",
}

export default function OrderHistory() {
  const { user } = useAuth()

  const [expanded, setExpanded] = useState<string | null>(null)

  const [orders, setOrders] = useState<Order[]>([])

  const [loading, setLoading] = useState(true)

  const [busyId, setBusyId] = useState<string | null>(null)

  const [error, setError] = useState("")

  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([])

  const [returnOrder, setReturnOrder] = useState<Order | null>(null)

  const [returnType, setReturnType] = useState<"refund" | "exchange">("refund")

  const [returnProductId, setReturnProductId] = useState("")

  const [returnReason, setReturnReason] = useState("")

  const [returnBusy, setReturnBusy] = useState(false)

  const [returnError, setReturnError] = useState("")

  const [returnProof, setReturnProof] = useState<File | null>(null)

  useEffect(() => {
    if (!user) return

    apiRequest<{ orders?: Order[] }>("my-orders.php")

      .then((payload) => {
        if (!Array.isArray(payload.orders)) {
          setOrders([])

          setError("Format data riwayat pesanan tidak valid")

          return
        }

        setOrders(
          payload.orders.map((order) => ({
            ...order,
            items: Array.isArray(order.items) ? order.items : [],
          })),
        )
      })

      .catch((reason: unknown) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Riwayat pesanan tidak dapat dimuat",
        ),
      )

      .finally(() => setLoading(false))

    apiRequest<{ returns?: ReturnRequest[] }>("returns.php")

      .then((payload) =>
        setReturnRequests(
          Array.isArray(payload.returns) ? payload.returns : [],
        ),
      )

      .catch(() => setReturnRequests([]))
  }, [user])

  const confirmReceived = async (order: Order) => {
    if (
      !window.confirm(
        `Konfirmasi bahwa paket ${order.orderId} sudah Anda terima?`,
      )
    )
      return

    setBusyId(order.orderId)

    setError("")

    try {
      await apiRequest("my-orders.php", {
        method: "POST",

        body: JSON.stringify({
          orderId: Number(order.orderId.replace("AMS-", "")),
        }),
      })

      setOrders((previous) =>
        previous.map((item) =>
          item.orderId === order.orderId
            ? { ...item, customerConfirmed: true }
            : item,
        ),
      )
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Konfirmasi penerimaan tidak dapat disimpan",
      )
    } finally {
      setBusyId(null)
    }
  }

  const submitReturn = async () => {
    if (
      !returnOrder ||
      !returnProductId ||
      !returnReason.trim() ||
      !returnProof
    ) {
      setReturnError(
        "Pilih produk, isi alasan, dan unggah bukti gambar terlebih dahulu.",
      )

      return
    }

    const selectedItem = returnOrder.items[Number(returnProductId)]

    if (!selectedItem) return

    setReturnBusy(true)

    setReturnError("")

    setError("")

    try {
      await apiRequest("returns.php", {
        method: "POST",
        body: JSON.stringify({
          orderId: Number(returnOrder.orderId.replace("AMS-", "")),
          productId: selectedItem.productId,
          quantity: 1,
          type: returnType,
          reason: returnReason,
          proof: await readFileAsDataUrl(returnProof),
        }),
      })

      const refreshed = await apiRequest<{ returns?: ReturnRequest[] }>(
        "returns.php",
      )

      setReturnRequests(
        Array.isArray(refreshed.returns) ? refreshed.returns : [],
      )

      setReturnOrder(null)

      setReturnReason("")

      setReturnProof(null)
    } catch (reason) {
      setReturnError(
        reason instanceof Error
          ? reason.message
          : "Permintaan tidak dapat disimpan",
      )
    } finally {
      setReturnBusy(false)
    }
  }

  if (!user) return <Navigate to="/auth" />

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1
        style={{ fontFamily: "var(--font-serif)", color: "var(--primary)" }}
        className="text-3xl font-bold mb-8"
      >
        Riwayat Pesanan
      </h1>

      {error && (
        <p role="alert" style={{ color: "#b91c1c", marginBottom: "16px" }}>
          {error}
        </p>
      )}
      {loading && (
        <p style={{ color: "var(--muted-foreground)" }}>Memuat pesanan...</p>
      )}
      {!loading && orders.length === 0 && !error && (
        <p style={{ color: "var(--muted-foreground)" }}>Belum ada pesanan.</p>
      )}
      <div className="space-y-4">
        {orders.map((order) => {
          const s = statusColor[order.status] ?? statusColor.completed

          return (
            <div
              key={order.orderId}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              <div className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div style={{ color: "var(--primary)", fontWeight: 700 }}>
                      {order.orderId}
                    </div>
                    <div
                      style={{
                        color: "var(--muted-foreground)",
                        fontSize: "13px",
                      }}
                    >
                      {order.date}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      style={{
                        background: s.bg,
                        color: s.text,
                        fontSize: "12px",
                        fontWeight: 700,
                        padding: "4px 12px",
                        borderRadius: "100px",
                      }}
                    >
                      {statusLabel[order.status]}
                    </span>
                    <span style={{ color: "var(--accent)", fontWeight: 700 }}>
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    marginTop: "12px",
                    color: "var(--muted-foreground)",
                    fontSize: "13px",
                  }}
                >
                  {order.items
                    .map((i) => `${i.name} (${i.color}) ×${i.quantity}`)
                    .join(", ")}
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() =>
                      setExpanded(
                        expanded === order.orderId ? null : order.orderId,
                      )
                    }
                    style={{
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                    }}
                    className="hover:opacity-80"
                  >
                    {expanded === order.orderId ? "Tutup" : "Detail"}
                  </button>
                  {order.status === "shipped" && (
                    <Link
                      to={`/track-order?order=${encodeURIComponent(order.orderId)}`}
                      style={{
                        background: "var(--primary)",
                        color: "var(--primary-foreground)",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                      className="hover:opacity-90"
                    >
                      Lacak Paket
                    </Link>
                  )}
                  {order.status === "shipped" && !order.customerConfirmed && (
                    <button
                      disabled={busyId === order.orderId}
                      onClick={() => void confirmReceived(order)}
                      style={{
                        background: "#dcfce7",
                        color: "#166534",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                      className="hover:opacity-90 disabled:opacity-50"
                    >
                      {busyId === order.orderId
                        ? "Menyimpan..."
                        : "Paket Sudah Diterima"}
                    </button>
                  )}
                  {order.customerConfirmed && order.status === "shipped" && (
                    <span
                      style={{
                        color: "#166534",
                        fontSize: "13px",
                        fontWeight: 600,
                        alignSelf: "center",
                      }}
                    >
                      Konfirmasi diterima terkirim ke admin
                    </span>
                  )}
                  {(["shipped", "completed"] as const).includes(
                    order.status,
                  ) && (
                    <button
                      onClick={() => {
                        setReturnOrder(order)
                        setReturnProductId("")
                        setReturnProof(null)
                        setReturnError("")
                      }}
                      style={{
                        color: "var(--accent)",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                      className="hover:opacity-70"
                    >
                      Pengembalian / Penukaran
                    </button>
                  )}
                </div>
              </div>

              {expanded === order.orderId && (
                <div
                  style={{
                    borderTop: "1px solid var(--border)",
                    padding: "16px 20px",
                    background: "var(--muted)",
                  }}
                >
                  <div className="space-y-3 mb-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span style={{ color: "var(--foreground)" }}>
                          {item.name} · {item.color} ×{item.quantity}
                        </span>
                        <span
                          style={{
                            color: "var(--foreground)",
                            fontWeight: 600,
                          }}
                        >
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                    <div
                      className="flex justify-between text-sm"
                      style={{
                        borderTop: "1px solid var(--border)",
                        paddingTop: "10px",
                      }}
                    >
                      <span style={{ color: "var(--muted-foreground)" }}>
                        Ongkos Kirim
                      </span>
                      <span style={{ color: "var(--foreground)" }}>
                        {formatPrice(order.shippingCost)}
                      </span>
                    </div>
                    <div
                      className="flex justify-between font-bold"
                      style={{ color: "var(--accent)" }}
                    >
                      <span>Total</span>
                      <span>{formatPrice(order.total)}</span>
                    </div>
                  </div>
                  {order.tracking && (
                    <div
                      style={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "10px",
                        padding: "12px 16px",
                        fontSize: "13px",
                      }}
                    >
                      {order.courier && (
                        <>
                          <span style={{ color: "var(--muted-foreground)" }}>
                            Kurir:{" "}
                          </span>
                          <span
                            style={{ color: "var(--primary)", fontWeight: 700 }}
                          >
                            {order.courier} ·{" "}
                          </span>
                        </>
                      )}
                      <span style={{ color: "var(--muted-foreground)" }}>
                        No. Resi:{" "}
                      </span>
                      <span
                        style={{ color: "var(--primary)", fontWeight: 700 }}
                      >
                        {order.tracking}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {returnRequests.length > 0 && (
        <div className="mt-8">
          <h2
            style={{ color: "var(--primary)", fontFamily: "var(--font-serif)" }}
            className="text-xl font-bold mb-3"
          >
            Pengajuan Saya
          </h2>
          <div className="space-y-2">
            {returnRequests.map((request) => (
              <div
                key={request.id}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "12px 16px",
                }}
                className="flex flex-wrap justify-between gap-2 text-sm"
              >
                <span style={{ color: "var(--foreground)" }}>
                  {request.id} ·{" "}
                  {request.type === "refund" ? "Refund" : "Penukaran"} ·{" "}
                  {request.product}
                </span>
                <span style={{ color: "var(--muted-foreground)" }}>
                  {request.status} · {request.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {returnOrder && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            overflowY: "auto",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="return-dialog-title"
            style={{
              background: "var(--card)",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "480px",
              maxHeight: "calc(100dvh - 32px)",
              overflowY: "auto",
              margin: "auto",
            }}
            className="p-6"
          >
            <div className="flex justify-between mb-5">
              <h2
                id="return-dialog-title"
                style={{
                  color: "var(--primary)",
                  fontFamily: "var(--font-serif)",
                }}
                className="text-xl font-bold"
              >
                Pengembalian / Penukaran
              </h2>
              <button
                type="button"
                onClick={() => {
                  setReturnOrder(null)
                  setReturnError("")
                }}
                style={{ color: "var(--muted-foreground)", fontSize: "20px" }}
              >
                ×
              </button>
            </div>
            <label
              style={{
                color: "var(--foreground)",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              Produk
            </label>
            <select
              value={returnProductId}
              onChange={(event) => setReturnProductId(event.target.value)}
              style={{
                border: "1px solid var(--border)",
                background: "var(--muted)",
                color: "var(--foreground)",
                width: "100%",
              }}
              className="px-3 py-2 rounded-lg mt-1 mb-4"
            >
              <option value="">Pilih produk</option>
              {returnOrder.items.map((item, index) => (
                <option key={`${item.name}-${index}`} value={index}>
                  {item.name} · {item.color}
                </option>
              ))}
            </select>
            <p
              style={{
                color: "var(--muted-foreground)",
                fontSize: "12px",
                marginTop: "-12px",
                marginBottom: "12px",
              }}
            >
              Produk akan dipetakan berdasarkan urutan item pesanan.
            </p>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setReturnType("refund")}
                style={{
                  border: `1px solid ${
                    returnType === "refund" ? "var(--accent)" : "var(--border)"
                  }`,
                  color: "var(--foreground)",
                  flex: 1,
                }}
                className="py-2 rounded-lg text-sm"
              >
                Refund
              </button>
              <button
                onClick={() => setReturnType("exchange")}
                style={{
                  border: `1px solid ${
                    returnType === "exchange"
                      ? "var(--accent)"
                      : "var(--border)"
                  }`,
                  color: "var(--foreground)",
                  flex: 1,
                }}
                className="py-2 rounded-lg text-sm"
              >
                Tukar Barang
              </button>
            </div>
            <label
              htmlFor="return-proof"
              style={{
                display: "block",
                color: "var(--foreground)",
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Bukti foto barang <span style={{ color: "#b91c1c" }}>*</span>
            </label>
            <input
              id="return-proof"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null
                if (
                  file &&
                  (!["image/jpeg", "image/png", "image/webp"].includes(
                    file.type,
                  ) ||
                    file.size > 5 * 1024 * 1024)
                ) {
                  setReturnProof(null)
                  setReturnError(
                    "Pilih gambar JPG, PNG, atau WebP maksimal 5 MB.",
                  )
                  event.target.value = ""
                  return
                }
                setReturnProof(file)
                setReturnError("")
              }}
              style={{
                display: "block",
                width: "100%",
                color: "var(--foreground)",
                fontSize: "12px",
                marginBottom: "8px",
              }}
            />
            {returnProof && (
              <div
                style={{
                  color: "var(--muted-foreground)",
                  fontSize: "11px",
                  marginBottom: "12px",
                }}
              >
                {returnProof.name}
              </div>
            )}
            {returnError && (
              <p
                role="alert"
                style={{
                  color: "#b91c1c",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  fontSize: "13px",
                  marginBottom: "12px",
                }}
              >
                {returnError}
              </p>
            )}
            <textarea
              value={returnReason}
              onChange={(event) => setReturnReason(event.target.value)}
              placeholder="Jelaskan alasan pengajuan"
              rows={4}
              style={{
                border: "1px solid var(--border)",
                background: "var(--muted)",
                color: "var(--foreground)",
                width: "100%",
              }}
              className="px-3 py-2 rounded-lg text-sm resize-none mb-4"
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setReturnOrder(null)
                  setReturnError("")
                }}
                style={{
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                  flex: "1 1 120px",
                }}
                className="py-3 rounded-lg font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={
                  returnBusy ||
                  !returnProductId ||
                  !returnReason.trim() ||
                  !returnProof
                }
                onClick={() => void submitReturn()}
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  flex: "2 1 180px",
                }}
                className="py-3 rounded-lg font-semibold disabled:opacity-50"
              >
                {returnBusy ? "Mengirim..." : "Kirim Pengajuan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
