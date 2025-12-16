import { useState, useRef, useEffect } from 'react';
import { Upload, TrendingUp, Calendar, Sparkles, Plus, Trash2, RotateCcw, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useFeatures, Feature } from '../contexts/FeaturesContext';
import { translations } from '../lib/translations';
import { api } from '../lib/api';
import { SearchAnalytics } from '../lib/types';

export function AdminPage() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { features, updateFeatures, resetFeatures } = useFeatures();
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [editingFeatures, setEditingFeatures] = useState<Feature[]>(features);

  const [dailyAnalytics, setDailyAnalytics] = useState<SearchAnalytics[]>([]);
  const [monthlyAnalytics, setMonthlyAnalytics] = useState<SearchAnalytics[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [stats, setStats] = useState({ total_vehicles: 0, total_users: 0, total_reviews: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    localStorage.removeItem('homepage-features'); // Force clear cache
    setLoadingAnalytics(true);
    try {
      const data = await api.getAdminStats();
      setStats({
        total_vehicles: data.total_vehicles,
        total_users: data.total_users,
        total_reviews: data.total_reviews
      });
      setDailyAnalytics(data.daily_searches);
      setMonthlyAnalytics(data.monthly_searches);

      // Load features
      const loadedFeatures = await api.getFeatures();
      console.log('Loaded features from API:', loadedFeatures);
      if (loadedFeatures.length > 0) {
        // Debug: Log hex codes for the first feature's Turkish title
        const first = loadedFeatures[0];
        console.log('First Feature Title (TR):', first.titleTr);
        console.log('Hex Codes (TR):', first.titleTr.split('').map(c => c.charCodeAt(0).toString(16)).join(' '));

        setEditingFeatures(loadedFeatures);
        updateFeatures(loadedFeatures); // Sync context
      }
    } catch (error) {
      console.error('Failed to load admin data:', error);
      toast.error(`Failed to load dashboard data: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (fileExtension === 'csv') {
        setUploadedFileName(file.name);
        const toastId = toast.loading(`${t.file} "${file.name}" ${t.fileUploaded}`);

        try {
          const result = await api.uploadVehicles(file);
          toast.dismiss(toastId);
          toast.success(`${t.vehiclesUploaded} (${result.imported_count} imported)`);
          if (result.errors && result.errors.length > 0) {
            toast.warning(`Completed with ${result.errors.length} errors. Check console.`);
            console.warn('Upload errors:', result.errors);
          }
          loadData(); // Refresh stats
        } catch (error: any) {
          toast.dismiss(toastId);
          toast.error(error.message || 'Upload failed');
        }
      } else {
        toast.error(t.pleaseUploadCSV || 'Please upload a CSV file');
      }
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await api.getUploadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vehicle_upload_template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error('Failed to download template');
    }
  };

  const handleFeatureChange = (index: number, field: keyof Feature, value: string) => {
    const updatedFeatures = [...editingFeatures];
    updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
    setEditingFeatures(updatedFeatures);
  };

  const handleAddFeature = () => {
    const newFeature: Feature = {
      id: Date.now().toString(),
      emoji: '⭐',
      titleEn: 'New Feature',
      titleTr: 'Yeni Özellik',
      titleAr: 'ميزة جديدة',
      descriptionEn: 'Feature description',
      descriptionTr: 'Özellik açıklaması',
      descriptionAr: 'وصف الميزة'
    };
    setEditingFeatures([...editingFeatures, newFeature]);
  };

  const handleRemoveFeature = (index: number) => {
    const updatedFeatures = editingFeatures.filter((_, i) => i !== index);
    setEditingFeatures(updatedFeatures);
  };

  const handleSaveFeatures = async () => {
    try {
      await api.updateFeatures(editingFeatures);
      updateFeatures(editingFeatures);
      toast.success('Features updated successfully!');
    } catch (error) {
      toast.error('Failed to update features');
    }
  };

  const handleResetFeatures = () => {
    resetFeatures();
    setEditingFeatures(features);
    toast.success('Features reset to defaults!');
  };

  const chartColors = {
    light: { bar: '#3b82f6', grid: '#e5e7eb', text: '#374151' },
    dark: { bar: '#60a5fa', grid: '#374151', text: '#d1d5db' },
    elite: { bar: '#fbbf24', grid: '#1f2937', text: '#fbbf24' }
  };

  const colors = chartColors[theme];

  return (
    <div className="bg-background">
      <div className="px-3 py-4 w-full">
        <h1 className="mb-4 text-foreground">{t.adminDashboard}</h1>

        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-4 bg-muted">
            <TabsTrigger value="analytics">
              <TrendingUp className="mr-2 h-4 w-4" />
              {t.analytics}
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="mr-2 h-4 w-4" />
              {t.uploadVehicles}
            </TabsTrigger>
            <TabsTrigger value="features">
              <Sparkles className="mr-2 h-4 w-4" />
              {t.editFeatures}
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            {/* Daily Analytics */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Calendar className="h-5 w-5" />
                  {t.topSearchesDay}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {t.mostSearchedDay}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                    <XAxis
                      dataKey="query"
                      stroke={colors.text}
                      tick={{ fill: colors.text }}
                    />
                    <YAxis
                      stroke={colors.text}
                      tick={{ fill: colors.text }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#1f2937' : theme === 'elite' ? '#000' : '#fff',
                        border: `1px solid ${colors.grid}`,
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: colors.text }}
                      formatter={(value: any) => [value, t.count]}
                    />
                    <Bar dataKey="count" fill={colors.bar} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  {dailyAnalytics.map((item, index) => (
                    <div key={item.query} className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl mb-1 text-primary">#{index + 1}</p>
                      <p className="text-foreground mb-1">{item.query}</p>
                      <p className="text-sm text-muted-foreground">{item.count} {t.searches}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Analytics */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <TrendingUp className="h-5 w-5" />
                  {t.topSearchesMonth}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {t.mostSearchedMonth}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={monthlyAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                    <XAxis
                      dataKey="query"
                      stroke={colors.text}
                      tick={{ fill: colors.text }}
                    />
                    <YAxis
                      stroke={colors.text}
                      tick={{ fill: colors.text }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#1f2937' : theme === 'elite' ? '#000' : '#fff',
                        border: `1px solid ${colors.grid}`,
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: colors.text }}
                      formatter={(value: any) => [value, t.count]}
                    />
                    <Bar dataKey="count" fill={colors.bar} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                  {monthlyAnalytics.map((item, index) => (
                    <div key={item.query} className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-xl mb-1 text-primary">#{index + 1}</p>
                      <p className="text-sm text-foreground mb-1">{item.query}</p>
                      <p className="text-xs text-muted-foreground">{item.count} {t.searches}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">{t.totalSearchesDay}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl text-primary">
                    {dailyAnalytics.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">{t.totalSearchesMonth}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl text-primary">
                    {monthlyAnalytics.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">{t.trendingBrand}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl text-primary">{monthlyAnalytics[0]?.query || '-'}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">{t.uploadVehicleData}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {t.importVehiclesDesc}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="mb-2 text-foreground">
                    {t.clickToUpload}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t.csvOrExcel || 'CSV files only'}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button onClick={() => fileInputRef.current?.click()}>
                    {t.selectFile}
                  </Button>
                  {uploadedFileName && (
                    <p className="mt-4 text-sm text-primary">
                      ✓ {uploadedFileName}
                    </p>
                  )}
                </div>

                <div className="bg-muted/50 rounded-lg p-6">
                  <h3 className="mb-3 text-foreground">{t.fileFormatRequirements}</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• {t.columnHeaders}</li>
                    <li>• {t.priceNumeric}</li>
                    <li>• {t.yearFormat}</li>
                    <li>• {t.imageUrls}</li>
                    <li>• {t.maxFileSize}</li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={handleDownloadTemplate} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    {t.downloadTemplate || 'Download Template'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">{t.editHomepageFeatures}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {t.customizeFeaturesDesc}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {editingFeatures.map((feature, index) => (
                  <Card key={feature.id} className="bg-muted/30 border-border">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-foreground">{t.feature} {index + 1}</h3>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveFeature(index)}
                          disabled={editingFeatures.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`emoji-${index}`}>{t.emoji}</Label>
                          <Input
                            id={`emoji-${index}`}
                            value={feature.emoji}
                            onChange={(e) => handleFeatureChange(index, 'emoji', e.target.value)}
                            placeholder="🔍"
                            maxLength={2}
                            className="text-2xl"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`titleEn-${index}`}>{t.titleEnglish}</Label>
                          <Input
                            id={`titleEn-${index}`}
                            value={feature.titleEn}
                            onChange={(e) => handleFeatureChange(index, 'titleEn', e.target.value)}
                            placeholder="Feature Title"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`titleTr-${index}`}>{t.titleTurkish}</Label>
                          <Input
                            id={`titleTr-${index}`}
                            value={feature.titleTr}
                            onChange={(e) => handleFeatureChange(index, 'titleTr', e.target.value)}
                            placeholder="Özellik Başlığı"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`titleAr-${index}`}>{t.titleArabic}</Label>
                          <Input
                            id={`titleAr-${index}`}
                            value={feature.titleAr}
                            onChange={(e) => handleFeatureChange(index, 'titleAr', e.target.value)}
                            placeholder="عنوان الميزة"
                            dir="rtl"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor={`descEn-${index}`}>{t.descriptionEnglish}</Label>
                          <Textarea
                            id={`descEn-${index}`}
                            value={feature.descriptionEn}
                            onChange={(e) => handleFeatureChange(index, 'descriptionEn', e.target.value)}
                            placeholder="Feature description..."
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`descTr-${index}`}>{t.descriptionTurkish}</Label>
                          <Textarea
                            id={`descTr-${index}`}
                            value={feature.descriptionTr}
                            onChange={(e) => handleFeatureChange(index, 'descriptionTr', e.target.value)}
                            placeholder="Özellik açıklaması..."
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`descAr-${index}`}>{t.descriptionArabic}</Label>
                          <Textarea
                            id={`descAr-${index}`}
                            value={feature.descriptionAr}
                            onChange={(e) => handleFeatureChange(index, 'descriptionAr', e.target.value)}
                            placeholder="وصف الميزة..."
                            rows={3}
                            dir="rtl"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="flex flex-wrap gap-4">
                  <Button onClick={handleAddFeature} variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    {t.addFeature}
                  </Button>
                  <Button onClick={handleSaveFeatures} className="bg-primary">
                    {t.saveFeatures}
                  </Button>
                  <Button
                    onClick={() => {
                      if (confirm(t.confirmReset)) {
                        localStorage.removeItem('homepage-features');
                        window.location.reload();
                      }
                    }}
                    variant="destructive"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {t.resetData}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
