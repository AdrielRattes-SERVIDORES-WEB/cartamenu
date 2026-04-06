import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Store, Users, ShoppingBag, Globe, Plus, Search } from 'lucide-react';

interface Tenant {
  id: string;
  slug: string;
  custom_domain: string | null;
  plan: string;
  status: string;
  created_at: string;
  owner_id: string | null;
}

interface TenantStats {
  id: string;
  order_count: number;
  total_revenue: number;
}

const SuperAdmin = () => {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState<Record<string, TenantStats>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/admin-login');
      return;
    }
    fetchTenants();
  }, [currentUser]);

  const fetchTenants = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar lojas');
    } else {
      setTenants(data || []);
      fetchStats(data || []);
    }
    setLoading(false);
  };

  const fetchStats = async (tenantList: Tenant[]) => {
    const statsMap: Record<string, TenantStats> = {};
    for (const tenant of tenantList) {
      const { data } = await supabase
        .from('orders')
        .select('total')
        .eq('tenant_id', tenant.id);
      if (data) {
        statsMap[tenant.id] = {
          id: tenant.id,
          order_count: data.length,
          total_revenue: data.reduce((sum, o) => sum + (o.total || 0), 0),
        };
      }
    }
    setStats(statsMap);
  };

  const toggleStatus = async (tenant: Tenant) => {
    const newStatus = tenant.status === 'active' ? 'suspended' : 'active';
    const { error } = await supabase
      .from('tenants')
      .update({ status: newStatus })
      .eq('id', tenant.id);
    if (error) {
      toast.error('Erro ao atualizar status');
    } else {
      toast.success(`Loja ${newStatus === 'active' ? 'ativada' : 'suspensa'}`);
      fetchTenants();
    }
  };

  const filtered = tenants.filter(t =>
    t.slug.includes(search.toLowerCase()) ||
    (t.custom_domain || '').includes(search.toLowerCase())
  );

  const totalRevenue = Object.values(stats).reduce((sum, s) => sum + s.total_revenue, 0);
  const totalOrders = Object.values(stats).reduce((sum, s) => sum + s.order_count, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-orange-600">CartaMenu</span>
          <Badge variant="outline">Super Admin</Badge>
        </div>
        <Button onClick={() => navigate('/novo')} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="w-4 h-4 mr-2" /> Nova Loja
        </Button>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Métricas globais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Store className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total de Lojas</p>
                  <p className="text-3xl font-bold">{tenants.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total de Pedidos</p>
                  <p className="text-3xl font-bold">{totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-3xl font-bold">€{totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de lojas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lojas</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar por slug ou domínio..."
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Carregando...</p>
            ) : filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhuma loja encontrada</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 pr-4">Slug</th>
                      <th className="pb-3 pr-4">Domínio</th>
                      <th className="pb-3 pr-4">Plano</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 pr-4">Pedidos</th>
                      <th className="pb-3 pr-4">Receita</th>
                      <th className="pb-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(tenant => (
                      <tr key={tenant.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 pr-4 font-medium">
                          <a
                            href={`/${tenant.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-orange-600 hover:underline flex items-center gap-1"
                          >
                            {tenant.slug}
                            <Globe className="w-3 h-3" />
                          </a>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {tenant.custom_domain || '—'}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant="outline">{tenant.plan}</Badge>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={tenant.status === 'active' ? 'default' : 'destructive'}>
                            {tenant.status === 'active' ? 'Ativa' : 'Suspensa'}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4">{stats[tenant.id]?.order_count ?? 0}</td>
                        <td className="py-3 pr-4">€{(stats[tenant.id]?.total_revenue ?? 0).toFixed(2)}</td>
                        <td className="py-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleStatus(tenant)}
                            className={tenant.status === 'active' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                          >
                            {tenant.status === 'active' ? 'Suspender' : 'Ativar'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdmin;
