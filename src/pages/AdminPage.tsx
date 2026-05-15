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
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

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

  useEffect(() => {
    if (isAdmin) void loadProducts();
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

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    const priceCents = Math.round(parseFloat(form.price_usd || "0") * 100);
    const payload = {
      name: form.name,
      description: form.description || null,
      price_cents: priceCents,
      currency: "usd",
      image_url: form.image_url || null,
      active: form.active,
    };

    if (editing && form.id) {
      const { error } = await supabase.from("products").update(payload).eq("id", form.id);
      if (error) return toast.error(error.message);
      toast.success("Updated");
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Created");
    }
    setForm(empty);
    setEditing(false);
    void loadProducts();
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

        <Card className="p-6 mb-8">
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
              <div>
                <Label>{t("admin.image")}</Label>
                <Input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
              <Label>{t("admin.active")}</Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit">{t("admin.save")}</Button>
              {editing && (
                <Button type="button" variant="outline" onClick={() => { setForm(empty); setEditing(false); }}>
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
      </main>
    </>
  );
}
