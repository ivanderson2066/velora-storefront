import { useEffect, useState, FormEvent } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Copy, ExternalLink, Receipt } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

interface Order {
  id: string;
  stripe_session_id: string;
  stripe_payment_intent: string | null;
  customer_email: string | null;
  amount_total: number;
  currency: string;
  status: string;
  items: Array<{ product_id: string; quantity: number }> | null;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  image_url: string | null;
  active: boolean;
}

const empty = {
  id: "",
  name: "",
  description: "",
  price_usd: "",
  image_url: "",
  active: true,
};

export default function AdminPage() {
  const { t } = useI18n();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // auth form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // products
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        void checkAdmin(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) void checkAdmin(session.user.id);
      setAuthLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const checkAdmin = async (uid: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .eq("role", "admin")
      .maybeSingle();
    setIsAdmin(!!data);
  };

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setProducts(data as Product[]);
  };


  // orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    setOrdersLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (!error && data) setOrders(data as unknown as Order[]);
    setOrdersLoading(false);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Failed to copy");
    }
  };

  useEffect(() => {
    if (isAdmin) {
      void loadProducts();
      void loadOrders();
    }
  }, [isAdmin]);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin + "/admin" },
    });
    if (error) toast.error(error.message);
    else toast.success("Account created. If this is the first admin, ask to be granted admin role.");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setUploading(true);
      let image_url = form.image_url || null;
      if (imageFile) {
        image_url = await uploadImage(imageFile);
      }
      const priceCents = Math.round(parseFloat(form.price_usd || "0") * 100);
      const payload = {
        name: form.name,
        description: form.description || null,
        price_cents: priceCents,
        currency: "usd",
        image_url,
        active: form.active,
      };

      if (editing && form.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", form.id);
        if (error) throw error;
        toast.success("Updated");
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
        toast.success("Created");
      }
      setForm(empty);
      setImageFile(null);
      setEditing(false);
      void loadProducts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (p: Product) => {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      price_usd: (p.price_cents / 100).toFixed(2),
      image_url: p.image_url ?? "",
      active: p.active,
    });
    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    void loadProducts();
  };

  if (authLoading) return <div className="p-8">{t("shop.loading")}</div>;

  if (!user) {
    return (
      <>
        <Helmet><title>Admin</title></Helmet>
        <main className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <h1 className="text-2xl font-light mb-6">{t("admin.title")}</h1>
            <form className="space-y-4">
              <div>
                <Label>{t("admin.email")}</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label>{t("admin.password")}</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" onClick={handleSignIn}>
                  {t("admin.signin")}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={handleSignUp}>
                  {t("admin.signup")}
                </Button>
              </div>
            </form>
          </Card>
        </main>
      </>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-6 max-w-md text-center">
          <p className="mb-4">{t("admin.no_access")}</p>
          <p className="text-xs text-muted-foreground mb-4 break-all">User ID: {user.id}</p>
          <Button variant="outline" onClick={handleSignOut}>{t("admin.signout")}</Button>
        </Card>
      </main>
    );
  }

  return (
    <>
      <Helmet><title>Admin · Products</title></Helmet>
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-light">{t("admin.title")}</h1>
          <Button variant="outline" size="sm" onClick={handleSignOut}>{t("admin.signout")}</Button>
        </div>

        {(() => {
          const paidOrders = orders.filter((o) => o.status === "paid");
          const revenueCents = paidOrders.reduce((s, o) => s + (o.amount_total || 0), 0);
          const currency = (paidOrders[0]?.currency || "usd").toUpperCase();
          const revenue = (revenueCents / 100).toLocaleString(undefined, { style: "currency", currency });
          return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <Card className="p-4"><p className="text-xs text-muted-foreground uppercase tracking-wider">Revenue (paid)</p><p className="text-xl font-medium mt-1">{revenue}</p></Card>
              <Card className="p-4"><p className="text-xs text-muted-foreground uppercase tracking-wider">Paid orders</p><p className="text-xl font-medium mt-1">{paidOrders.length}</p></Card>
              <Card className="p-4"><p className="text-xs text-muted-foreground uppercase tracking-wider">Total orders</p><p className="text-xl font-medium mt-1">{orders.length}</p></Card>
              <Card className="p-4"><p className="text-xs text-muted-foreground uppercase tracking-wider">Active products</p><p className="text-xl font-medium mt-1">{products.filter(p=>p.active).length}/{products.length}</p></Card>
            </div>
          );
        })()}

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders {orders.length > 0 && `(${orders.length})`}</TabsTrigger>
          </TabsList>


          <TabsContent value="products" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">
                {editing ? t("admin.edit") : t("admin.new")}
              </h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <Label>{t("admin.name")}</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <Label>{t("admin.description")}</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t("admin.price")}</Label>
                    <Input type="number" step="0.01" min="0" value={form.price_usd} onChange={(e) => setForm({ ...form, price_usd: e.target.value })} required />
                  </div>
                </div>
                <div>
                  <Label>{t("admin.image_file")}</Label>
                  {form.image_url && !imageFile && (
                    <div className="mb-2 flex items-center gap-3">
                      <img src={form.image_url} alt="" className="w-20 h-20 object-cover rounded border" />
                      <span className="text-xs text-muted-foreground">{t("admin.replace_image")}</span>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                  <Label>{t("admin.active")}</Label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={uploading}>
                    {uploading ? t("admin.uploading") : t("admin.save")}
                  </Button>
                  {editing && (
                    <Button type="button" variant="outline" onClick={() => { setForm(empty); setImageFile(null); setEditing(false); }}>
                      {t("admin.cancel")}
                    </Button>
                  )}
                </div>
              </form>
            </Card>

            <div className="space-y-3">
              {products.map((p) => (
                <Card key={p.id} className="p-4 flex items-center gap-4">
                  {p.image_url && <img src={p.image_url} alt="" className="w-16 h-16 object-cover rounded" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{p.name}</p>
                    <p className="text-sm text-muted-foreground">${(p.price_cents / 100).toFixed(2)} · {p.active ? "active" : "inactive"}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(p)}>{t("admin.edit")}</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id)}>{t("admin.delete")}</Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {ordersLoading ? "Loading orders…" : `${orders.length} order${orders.length === 1 ? "" : "s"}`}
              </p>
              <Button variant="outline" size="sm" onClick={() => void loadOrders()}>Refresh</Button>
            </div>

            {orders.length === 0 && !ordersLoading && (
              <Card className="p-10 text-center">
                <p className="text-sm text-muted-foreground">No orders yet. Paid checkouts will appear here automatically.</p>
              </Card>
            )}

            <div className="space-y-3">
              {orders.map((o) => {
                const date = new Date(o.created_at).toLocaleString();
                const amount = (o.amount_total / 100).toLocaleString(undefined, {
                  style: "currency",
                  currency: (o.currency || "usd").toUpperCase(),
                });
                const statusVariant: "default" | "secondary" | "destructive" | "outline" =
                  o.status === "paid" ? "default" : o.status === "pending" ? "secondary" : "destructive";
                return (
                  <Card
                    key={o.id}
                    onClick={() => setSelectedOrder(o)}
                    className="p-5 cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={statusVariant} className="capitalize">{o.status}</Badge>
                          <span className="text-xs text-muted-foreground">{date}</span>
                        </div>
                        <p className="font-medium">{o.customer_email ?? "—"}</p>
                        <p className="text-xs font-mono text-muted-foreground break-all mt-1">
                          {o.stripe_session_id}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-medium">{amount}</p>
                        {o.items && (
                          <p className="text-xs text-muted-foreground">
                            {o.items.reduce((sum, i) => sum + (i.quantity || 0), 0)} item(s)
                          </p>
                        )}
                      </div>
                    </div>
                    {o.items && o.items.length > 0 && (
                      <div className="border-t pt-3 space-y-1">
                        {o.items.map((it, idx) => {
                          const product = products.find((p) => p.id === it.product_id);
                          return (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-muted-foreground truncate">
                                {product?.name ?? it.product_id}
                              </span>
                              <span className="ml-3 shrink-0">× {it.quantity}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Order details dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            {selectedOrder && (() => {
              const o = selectedOrder;
              const amount = (o.amount_total / 100).toLocaleString(undefined, {
                style: "currency",
                currency: (o.currency || "usd").toUpperCase(),
              });
              const itemCount = o.items?.reduce((s, i) => s + (i.quantity || 0), 0) ?? 0;
              const statusVariant: "default" | "secondary" | "destructive" | "outline" =
                o.status === "paid" ? "default" : o.status === "pending" ? "secondary" : "destructive";
              return (
                <>
                  <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Receipt className="h-5 w-5 text-muted-foreground" />
                      <Badge variant={statusVariant} className="capitalize">{o.status}</Badge>
                    </div>
                    <DialogTitle className="text-2xl font-light">Order details</DialogTitle>
                    <DialogDescription>
                      Placed on {new Date(o.created_at).toLocaleString()}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6 mt-4">
                    {/* Summary */}
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/40 border">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Total</p>
                        <p className="text-2xl font-light">{amount}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Items</p>
                        <p className="text-2xl font-light">{itemCount}</p>
                      </div>
                    </div>

                    {/* Customer */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">Customer</h3>
                      <Card className="p-4 flex items-center justify-between gap-3">
                        <span className="text-sm break-all">{o.customer_email ?? "—"}</span>
                        {o.customer_email && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(o.customer_email!, "Email")}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </Card>
                    </div>

                    {/* Items */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">Items</h3>
                      <Card className="divide-y">
                        {(o.items ?? []).map((it, idx) => {
                          const product = products.find((p) => p.id === it.product_id);
                          const lineTotal = product
                            ? (product.price_cents * it.quantity / 100).toLocaleString(undefined, {
                                style: "currency",
                                currency: (product.currency || "usd").toUpperCase(),
                              })
                            : null;
                          return (
                            <div key={idx} className="flex items-center gap-3 p-4">
                              {product?.image_url && (
                                <img
                                  src={product.image_url}
                                  alt=""
                                  className="w-14 h-14 rounded object-cover border"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{product?.name ?? "Unknown product"}</p>
                                <p className="text-xs font-mono text-muted-foreground truncate">{it.product_id}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-sm">× {it.quantity}</p>
                                {lineTotal && <p className="text-xs text-muted-foreground">{lineTotal}</p>}
                              </div>
                            </div>
                          );
                        })}
                        {(!o.items || o.items.length === 0) && (
                          <div className="p-4 text-sm text-muted-foreground text-center">No items recorded.</div>
                        )}
                      </Card>
                    </div>

                    {/* Stripe references */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">Stripe references</h3>
                      <div className="space-y-2">
                        <Card className="p-3 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">Session</p>
                            <p className="text-xs font-mono break-all">{o.stripe_session_id}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(o.stripe_session_id, "Session ID")}>
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" asChild>
                              <a
                                href={`https://dashboard.stripe.com/payments/${o.stripe_payment_intent ?? ""}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </Button>
                          </div>
                        </Card>
                        {o.stripe_payment_intent && (
                          <Card className="p-3 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">Payment intent</p>
                              <p className="text-xs font-mono break-all">{o.stripe_payment_intent}</p>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(o.stripe_payment_intent!, "Payment intent")}>
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </Card>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>

      </main>
    </>
  );
}
