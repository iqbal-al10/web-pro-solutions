import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("portfolio");
  const [portfolios, setPortfolios] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");
  const navigate = useNavigate();
  const [waitingPayments, setWaitingPayments] = useState([]);
  const [waitingLoading, setWaitingLoading] = useState(false);

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved === "true" || false;
  });

  // Notification State
  const [showNotification, setShowNotification] = useState(false);
  const [latestOrder, setLatestOrder] = useState(null);

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Archive Dropdown State
  const [expandedArchive, setExpandedArchive] = useState(null);

  // Analytics State
  const [analyticsData, setAnalyticsData] = useState({
    totalVisitors: 0,
    totalUniqueVisitors: 0,
    totalPageViews: 0,
    totalBuyers: 0,
    todayVisitors: 0,
    todayUniqueVisitors: 0,
    todayBuyers: 0,
    thisWeekVisitors: [],
    trafficSources: { direct: 0, google: 0, social: 0, referral: 0 },
    deviceStats: { mobile: 0, tablet: 0, desktop: 0 },
    deviceDetails: [],
    topPages: [],
    visitorsChartData: [],
    buyersChartData: [],
  });
  const [dateRange, setDateRange] = useState("week");
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Backup State
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupHistory, setBackupHistory] = useState([]);
  const [restoreFile, setRestoreFile] = useState(null);

  // Chart Data State
  const [chartData, setChartData] = useState(null);

  const [standardOpen, setStandardOpen] = useState(false);
  const [professionalOpen, setProfessionalOpen] = useState(false);

  // Modal States
  const [modal, setModal] = useState({
    isOpen: false,
    type: "",
    title: "",
    message: "",
    onConfirm: null,
    data: null,
  });

  const [acceptModal, setAcceptModal] = useState({
    isOpen: false,
    project: null,
    estimateDays: "",
    assignedTo: "",
  });

  const MASTER_STANDARD_FEATURES = [
    "Responsive & Adaptive Design",
    "SSL Security Certificate",
    "Performance Optimization",
    "Basic CMS Management",
    "Contact Form Integration",
    "Basic SEO Optimization",
    "Premium UI/UX Design",
  ];
  const MASTER_PROFESSIONAL_FEATURES = [
    "Secure Cloud Infrastructure",
    "Advanced CMS & Content Management",
    "Payment Gateway Integration",
    "WhatsApp API Integration",
    "Advanced Analytics Dashboard",
    "Role-Based Access Control",
    "Advanced SEO Optimization",
    "Automated Backup & Recovery",
    "Third-Party API Integration",
    "Enterprise Security Features",
  ];

  const [formData, setFormData] = useState({
    title: "",
    category: "Corporate",
    base_price: "",
    thumbnail_url: "",
    preview_url: "",
    features: [],
    slug: "",
    description: "",
  });

  const [projectData, setProjectData] = useState({
    client_name: "",
    no_hp: "",
    project_title: "",
    website_category: "Corporate",
    features: [],
    price: "",
    estimate_days: "",
    assigned_to: "",
    status: "Development",
    progress_percent: 0,
    daily_task: "",
    notes: "",
  });

  // Fetch Waiting Payment
  const fetchWaitingPayments = async () => {
    setWaitingLoading(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .select(
          `
        *,
        payments(*)
      `,
        )
        .eq("status", "Menunggu Konfirmasi")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setWaitingPayments(data || []);
    } catch (error) {
      console.error("Error fetching waiting payments:", error);
      showAlert("Gagal mengambil data: " + error.message);
    } finally {
      setWaitingLoading(false);
    }
  };

  const confirmPayment = async (projectId, paymentId) => {
    showConfirm(
      "Konfirmasi Pembayaran",
      "Apakah Anda yakin pembayaran sudah valid? Proyek akan masuk ke Production Line.",
      async () => {
        try {
          // Update status payment
          await supabase
            .from("payments")
            .update({
              payment_status: "confirmed",
              confirmed_at: new Date().toISOString(),
            })
            .eq("id", paymentId);

          // Update status project menjadi 'Pending'
          await supabase
            .from("projects")
            .update({ status: "Pending" })
            .eq("id", projectId);

          showAlert(
            "✅ Pembayaran dikonfirmasi! Proyek masuk ke Production Line.",
          );
          fetchWaitingPayments();
          fetchProjects();
        } catch (error) {
          console.error("Error confirming payment:", error);
          showAlert("❌ Gagal konfirmasi: " + error.message);
        }
      },
    );
  };

  // Finance Data
  const [completedProjects, setCompletedProjects] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState({
    "Landing Page": 0,
    Corporate: 0,
    "E-Commerce": 0,
    Portfolio: 0,
    Custom: 0,
  });

  // Dark Mode Effect
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/login");
    });
  }, [navigate]);

  useEffect(() => {
    fetchPortfolios();
    fetchTestimonials();
    fetchProjects();
    fetchAnalyticsData();
    loadBackupHistory();

    const projectSub = supabase
      .channel("public:projects")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        () => {
          fetchProjects();
        },
      )
      .subscribe();

    const pendingSub = supabase
      .channel("pending-orders")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "projects",
          filter: "status=eq.Pending",
        },
        (payload) => {
          setLatestOrder(payload.new);
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 5000);
        },
      )
      .subscribe();

    const portfolioSub = supabase
      .channel("public:portfolios")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "portfolios" },
        fetchPortfolios,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(projectSub);
      supabase.removeChannel(pendingSub);
      supabase.removeChannel(portfolioSub);
    };
  }, []);

  const fetchPortfolios = async () => {
    const { data } = await supabase
      .from("portfolios")
      .select("*")
      .order("created_at", { ascending: false });
    setPortfolios(data || []);
  };

  const fetchTestimonials = async () => {
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });
    setTestimonials(data || []);
  };

  const fetchProjects = async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    setProjects(data || []);

    const completed = (data || []).filter((p) => p.status === "Selesai");
    setCompletedProjects(completed);

    const total = completed.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
    setTotalRevenue(total);

    const breakdown = {
      "Landing Page": 0,
      Corporate: 0,
      "E-Commerce": 0,
      Portfolio: 0,
      Custom: 0,
    };
    completed.forEach((p) => {
      const cat = p.website_category || "Custom";
      if (breakdown[cat] !== undefined) breakdown[cat] += Number(p.price) || 0;
      else breakdown["Custom"] += Number(p.price) || 0;
    });
    setCategoryBreakdown(breakdown);

    setChartData({
      labels: Object.keys(breakdown).filter((cat) => breakdown[cat] > 0),
      values: Object.values(breakdown).filter((val) => val > 0),
    });
  };

  // ========== FUNGSI ANALYTICS ==========
  const fetchAnalyticsData = async () => {
    setAnalyticsLoading(true);
    try {
      const { data: visitorsData, error: visitorsError } = await supabase
        .from("visitors")
        .select("*")
        .order("visited_at", { ascending: false });

      if (visitorsError) throw visitorsError;

      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (projectsError) throw projectsError;

      const uniqueSessions = new Set();
      visitorsData.forEach((v) => uniqueSessions.add(v.session_id));
      const totalUniqueVisitors = uniqueSessions.size;
      const totalPageViews = visitorsData.length;

      const uniqueBuyers = new Set();
      projectsData.forEach((p) => {
        if (p.no_hp) uniqueBuyers.add(p.no_hp);
        else uniqueBuyers.add(p.client_name);
      });
      const totalBuyers = uniqueBuyers.size;

      const today = new Date().toISOString().split("T")[0];
      const todayVisitors = visitorsData.filter((v) =>
        v.visited_at?.startsWith(today),
      ).length;
      const todayUniqueSessions = new Set();
      visitorsData
        .filter((v) => v.visited_at?.startsWith(today))
        .forEach((v) => todayUniqueSessions.add(v.session_id));
      const todayUniqueVisitors = todayUniqueSessions.size;
      const todayBuyers = projectsData.filter((p) =>
        p.created_at?.startsWith(today),
      ).length;

      const sources = { direct: 0, google: 0, social: 0, referral: 0 };
      const sourceSessionMap = new Map();
      visitorsData.forEach((v) => {
        const key = `${v.session_id}|${v.source}`;
        if (!sourceSessionMap.has(key)) {
          sourceSessionMap.set(key, true);
          if (sources[v.source] !== undefined) sources[v.source]++;
          else sources.direct++;
        }
      });

      const devices = { mobile: 0, tablet: 0, desktop: 0 };
      const deviceSessionMap = new Map();
      visitorsData.forEach((v) => {
        const key = `${v.session_id}|${v.device}`;
        if (!deviceSessionMap.has(key)) {
          deviceSessionMap.set(key, true);
          if (devices[v.device] !== undefined) devices[v.device]++;
          else devices.desktop++;
        }
      });

      // Hitung device details (brand, model, browser, OS)
      const deviceMap = new Map();
      visitorsData.forEach((v) => {
        const key = `${v.device_brand}|${v.device_model}|${v.browser_name}|${v.os_name}|${v.os_version}`;
        if (!deviceMap.has(key)) {
          deviceMap.set(key, {
            brand: v.device_brand || "Unknown",
            model: v.device_model || "Unknown",
            browser: v.browser_name || "Unknown",
            os: v.os_name || "Unknown",
            osVersion: v.os_version || "Unknown",
            count: 1,
          });
        } else {
          const existing = deviceMap.get(key);
          existing.count++;
          deviceMap.set(key, existing);
        }
      });

      const deviceDetails = Array.from(deviceMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 20); // Ambil 20 terbanyak

      const pageCount = {};
      visitorsData.forEach((v) => {
        const page = v.page || "/";
        pageCount[page] = (pageCount[page] || 0) + 1;
      });
      const topPages = Object.entries(pageCount)
        .map(([page, views]) => ({ page, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      const visitorsChartData = [];
      const buyersChartData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const dayName = date.toLocaleDateString("id-ID", { weekday: "short" });

        const dayVisitors = new Set();
        visitorsData
          .filter((v) => v.visited_at?.startsWith(dateStr))
          .forEach((v) => dayVisitors.add(v.session_id));
        const dayBuyers = projectsData.filter((p) =>
          p.created_at?.startsWith(dateStr),
        ).length;

        visitorsChartData.push({ date: dayName, visitors: dayVisitors.size });
        buyersChartData.push({ date: dayName, buyers: dayBuyers });
      }

      setAnalyticsData({
        totalVisitors: visitorsData.length,
        totalUniqueVisitors: totalUniqueVisitors,
        totalPageViews: totalPageViews,
        totalBuyers: totalBuyers,
        todayVisitors: todayVisitors,
        todayUniqueVisitors: todayUniqueVisitors,
        todayBuyers: todayBuyers,
        thisWeekVisitors: [],
        trafficSources: sources,
        deviceStats: devices,
        deviceDetails: deviceDetails,
        topPages: topPages,
        visitorsChartData: visitorsChartData,
        buyersChartData: buyersChartData,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      showAlert("Gagal mengambil data analytics: " + error.message);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleResetAnalytics = async () => {
    showConfirm(
      "Reset Analytics Data",
      "Peringatan! Tindakan ini akan MENGHAPUS semua data pengunjung (tabel visitors). Data pembeli (projects) TIDAK akan terhapus. Lanjutkan?",
      async () => {
        try {
          const { error } = await supabase
            .from("visitors")
            .delete()
            .neq("id", 0);

          if (error) throw error;

          localStorage.removeItem("visitor_session_id");
          localStorage.removeItem("visitor_last_active");

          showAlert("✅ Data analytics berhasil direset!");
          fetchAnalyticsData();
        } catch (error) {
          console.error("Error resetting analytics:", error);
          showAlert("❌ Gagal mereset data: " + error.message);
        }
      },
    );
  };

  // ========== FUNGSI BACKUP ==========
  const loadBackupHistory = () => {
    const history = JSON.parse(localStorage.getItem("backup_history") || "[]");
    setBackupHistory(history);
  };

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      const tables = ["portfolios", "projects", "testimonials"];
      const backupData = {};

      for (const table of tables) {
        const { data, error } = await supabase.from(table).select("*");
        if (error) throw error;
        backupData[table] = data;
      }

      const backupPackage = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        data: backupData,
      };

      const jsonStr = JSON.stringify(backupPackage, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `webpro_backup_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const history = JSON.parse(
        localStorage.getItem("backup_history") || "[]",
      );
      history.unshift({
        id: Date.now(),
        date: new Date().toISOString(),
        filename: `webpro_backup_${new Date().toISOString().split("T")[0]}.json`,
        size: blob.size,
      });
      localStorage.setItem(
        "backup_history",
        JSON.stringify(history.slice(0, 10)),
      );
      setBackupHistory(history.slice(0, 10));

      showAlert("✅ Backup berhasil! File telah diunduh.");
    } catch (error) {
      console.error("Backup error:", error);
      showAlert("❌ Gagal melakukan backup: " + error.message);
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreFile) {
      showAlert("Silakan pilih file backup terlebih dahulu!");
      return;
    }

    showConfirm(
      "Restore Data",
      "Peringatan! Restore data akan MENIMPA data yang ada saat ini. Lanjutkan?",
      async () => {
        setBackupLoading(true);
        try {
          const fileContent = await restoreFile.text();
          const backupData = JSON.parse(fileContent);

          if (!backupData.data || !backupData.version) {
            throw new Error("Format file backup tidak valid");
          }

          const tables = ["portfolios", "projects", "testimonials"];
          for (const table of tables) {
            if (backupData.data[table]) {
              await supabase.from(table).delete().neq("id", 0);
              for (const item of backupData.data[table]) {
                await supabase.from(table).insert([item]);
              }
            }
          }

          await fetchPortfolios();
          await fetchProjects();
          await fetchTestimonials();

          setRestoreFile(null);
          showAlert("✅ Restore data berhasil!");
        } catch (error) {
          console.error("Restore error:", error);
          showAlert("❌ Gagal restore data: " + error.message);
        } finally {
          setBackupLoading(false);
        }
      },
    );
  };

  // ========== EXPORT FUNCTIONS ==========
  const exportToExcel = () => {
    const exportData = completedProjects.map((proj) => ({
      "Nama Client": proj.client_name,
      "No. WhatsApp": proj.no_hp,
      "Nama Proyek": proj.project_title,
      Kategori: proj.website_category || "Custom",
      Harga: `Rp ${Number(proj.price || 0).toLocaleString()}`,
      "Tanggal Selesai": new Date(
        proj.updated_at || proj.created_at,
      ).toLocaleDateString("id-ID"),
      "Estimasi Hari": proj.estimate_days,
      Developer: proj.assigned_to || "-",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Finance Report");
    XLSX.writeFile(
      wb,
      `Finance_Report_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    showAlert("✅ Data berhasil diexport ke Excel!");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Laporan Keuangan Web Pro Solutions", 14, 15);
    doc.setFontSize(10);
    doc.text(`Tanggal: ${new Date().toLocaleDateString("id-ID")}`, 14, 25);
    doc.text(`Total Revenue: Rp ${totalRevenue.toLocaleString()}`, 14, 32);
    doc.text(`Total Proyek Selesai: ${completedProjects.length}`, 14, 39);

    const tableData = completedProjects.map((proj) => [
      proj.client_name,
      proj.project_title,
      proj.website_category || "Custom",
      `Rp ${Number(proj.price || 0).toLocaleString()}`,
      new Date(proj.updated_at || proj.created_at).toLocaleDateString("id-ID"),
    ]);

    autoTable(doc, {
      head: [["Client", "Proyek", "Kategori", "Harga", "Selesai"]],
      body: tableData,
      startY: 45,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [30, 58, 138] },
    });

    doc.save(`Finance_Report_${new Date().toISOString().split("T")[0]}.pdf`);
    showAlert("✅ Data berhasil diexport ke PDF!");
  };

  // ========== PRINT INVOICE ==========
  const printInvoice = (proj) => {
    const invoiceWindow = window.open("", "_blank");
    const featuresList =
      proj.features && typeof proj.features === "string"
        ? proj.features
            .split(",")
            .map((f) => `<li style="padding: 4px 0;">✓ ${f.trim()}</li>`)
            .join("")
        : "<li>Tidak ada features</li>";

    invoiceWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${proj.project_title}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Poppins', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; background: #fff; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1e3a8a; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: 900; color: #1e3a8a; }
          .subtitle { color: #64748b; font-size: 12px; margin-top: 5px; }
          .invoice-title { font-size: 28px; font-weight: 900; margin: 20px 0; text-align: center; }
          .info { margin: 20px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f8fafc; padding: 20px; border-radius: 16px; }
          .info p { margin: 5px 0; font-size: 12px; }
          .info strong { color: #1e3a8a; }
          .features { margin: 20px 0; background: #f1f5f9; padding: 20px; border-radius: 16px; }
          .features h3 { color: #1e3a8a; margin-bottom: 10px; font-size: 14px; }
          .features ul { columns: 2; list-style: none; padding: 0; }
          .features li { padding: 4px 0; font-size: 11px; }
          .total { text-align: right; font-size: 24px; font-weight: 900; color: #1e3a8a; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
          .footer { text-align: center; margin-top: 50px; color: #94a3b8; font-size: 10px; }
          .badge { background: #22c55e; color: white; padding: 4px 12px; border-radius: 20px; font-size: 10px; display: inline-block; margin-top: 10px; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">WEB PRO SOLUTIONS</div>
          <div class="subtitle">Digital Agency • Website Development • IT Consulting</div>
        </div>
        <div class="invoice-title">INVOICE</div>
        <div class="info">
          <div>
            <p><strong>Invoice To:</strong></p>
            <p>${proj.client_name}</p>
            <p>${proj.no_hp || "-"}</p>
          </div>
          <div>
            <p><strong>Project Details:</strong></p>
            <p>${proj.project_title}</p>
            <p>${proj.website_category || "Custom"}</p>
            <p>Tanggal: ${new Date(proj.created_at).toLocaleDateString("id-ID")}</p>
          </div>
        </div>
        <div class="features">
          <h3>📋 Project Features</h3>
          <ul>${featuresList}</ul>
        </div>
        <div class="total">
          Total Investment: Rp ${Number(proj.price || 0).toLocaleString()}
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <span class="badge">✓ Project Completed</span>
        </div>
        <div class="footer">
          <p>Terima kasih telah mempercayai Web Pro Solutions!</p>
          <p>This invoice is generated automatically on ${new Date().toLocaleDateString("id-ID")}</p>
        </div>
        <div class="no-print" style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #1e3a8a; color: white; border: none; border-radius: 8px; cursor: pointer;">🖨️ Print Invoice</button>
        </div>
      </body>
      </html>
    `);
    invoiceWindow.document.close();
  };

  // ========== FILTERED PROJECTS ==========
  const filteredActiveProjects = projects
    .filter((p) => p.status !== "Selesai" && p.status !== "Pending")
    .filter((proj) => {
      const matchesSearch =
        proj.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proj.project_title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || proj.website_category === categoryFilter;
      const matchesStatus =
        statusFilter === "all" || proj.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });

  // ========== IMAGE UPLOAD ==========
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSaveStatus("Uploading Image...");
    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${file.name.split(".").pop()}`;
      const { error: uploadError } = await supabase.storage
        .from("portfolio-assets")
        .upload(fileName, file, { cacheControl: "3600", upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage
        .from("portfolio-assets")
        .getPublicUrl(fileName);
      setFormData((prev) => ({ ...prev, thumbnail_url: data.publicUrl }));
      setSaveStatus("Image Ready!");
    } catch (err) {
      showAlert("Upload Gagal: " + err.message);
      setSaveStatus("Upload Error");
    }
    setTimeout(() => setSaveStatus(""), 2000);
  };

  // ========== CATALOG SYNC ==========
  const handleCatalogSync = (e) => {
    const val = e.target.value;
    if (val === "CUSTOM_PROJECT") {
      setProjectData((prev) => ({
        ...prev,
        project_title: "Custom Project Development",
        website_category: "Custom",
        price: "",
        features: [],
        notes: "",
      }));
      return;
    }
    const tpl = portfolios.find((p) => p.title === val);
    if (tpl) {
      const featuresText = tpl.features || "";
      const featuresArray = featuresText
        ? featuresText.split(",").map((f) => f.trim())
        : [];
      setProjectData((prev) => ({
        ...prev,
        project_title: tpl.title,
        website_category: tpl.category,
        price: tpl.base_price,
        features: featuresArray,
        notes: "",
      }));
    } else if (val !== "" && val !== "CUSTOM_PROJECT") {
      setProjectData((prev) => ({ ...prev, project_title: val }));
    }
  };

  // ========== FEATURE TOGGLES ==========
  const handleFormFeatureToggle = (feat) => {
    setFormData((prev) => {
      const cur = Array.isArray(prev.features) ? prev.features : [];
      return {
        ...prev,
        features: cur.includes(feat)
          ? cur.filter((f) => f !== feat)
          : [...cur, feat],
      };
    });
  };

  const handleSelectAllStandard = (check) =>
    setFormData((prev) => {
      const cur = Array.isArray(prev.features) ? prev.features : [];
      const filtered = cur.filter((f) => !MASTER_STANDARD_FEATURES.includes(f));
      return {
        ...prev,
        features: check ? [...filtered, ...MASTER_STANDARD_FEATURES] : filtered,
      };
    });

  const handleSelectAllProfessional = (check) =>
    setFormData((prev) => {
      const cur = Array.isArray(prev.features) ? prev.features : [];
      const filtered = cur.filter(
        (f) => !MASTER_PROFESSIONAL_FEATURES.includes(f),
      );
      return {
        ...prev,
        features: check
          ? [...filtered, ...MASTER_PROFESSIONAL_FEATURES]
          : filtered,
      };
    });

  // ========== CUSTOM FEATURE TOGGLES ==========
  const handleCustomFeatureToggle = (feat, currentFeatures) => {
    const cur = Array.isArray(currentFeatures) ? [...currentFeatures] : [];
    const newFeatures = cur.includes(feat)
      ? cur.filter((f) => f !== feat)
      : [...cur, feat];
    setProjectData((prev) => ({ ...prev, features: newFeatures }));
  };

  const handleSelectAllCustomStandard = (check, currentFeatures) => {
    const cur = Array.isArray(currentFeatures) ? [...currentFeatures] : [];
    const filtered = cur.filter((f) => !MASTER_STANDARD_FEATURES.includes(f));
    setProjectData((prev) => ({
      ...prev,
      features: check ? [...filtered, ...MASTER_STANDARD_FEATURES] : filtered,
    }));
  };

  const handleSelectAllCustomProfessional = (check, currentFeatures) => {
    const cur = Array.isArray(currentFeatures) ? [...currentFeatures] : [];
    const filtered = cur.filter(
      (f) => !MASTER_PROFESSIONAL_FEATURES.includes(f),
    );
    setProjectData((prev) => ({
      ...prev,
      features: check
        ? [...filtered, ...MASTER_PROFESSIONAL_FEATURES]
        : filtered,
    }));
  };

  // ========== CHECKLIST TOGGLE ==========
  const handleChecklistToggle = async (
    projId,
    item,
    currentChecklist = [],
    totalCount = 1,
  ) => {
    let list = Array.isArray(currentChecklist) ? [...currentChecklist] : [];

    if (list.includes(item)) {
      list = list.filter((i) => i !== item);
    } else {
      list.push(item);
    }

    const progress = Math.round((list.length / totalCount) * 100);

    const { error } = await supabase
      .from("projects")
      .update({ checklist: list, progress_percent: progress })
      .eq("id", projId);

    if (error) {
      console.error("Error updating checklist:", error);
      showAlert("Gagal update checklist: " + error.message);
    } else {
      fetchProjects();
    }
  };

  // ========== DAILY TASK ==========
  const updateDailyTask = async (id, task) => {
    setSaveStatus("Saving...");
    await supabase
      .from("projects")
      .update({ daily_task: task || "" })
      .eq("id", id);
    setTimeout(() => {
      setSaveStatus("");
      fetchProjects();
    }, 500);
  };

  // ========== ACCEPT / DECLINE PENDING ==========
  const handleAcceptPending = (proj) => {
    setAcceptModal({
      isOpen: true,
      project: proj,
      estimateDays: "7",
      assignedTo: "",
    });
  };

  const submitAccept = async () => {
    const { project, estimateDays, assignedTo } = acceptModal;
    if (!assignedTo.trim()) {
      showAlert("Mohon isi nama PIC/Developer!");
      return;
    }
    if (!estimateDays || isNaN(estimateDays)) {
      showAlert("Mohon isi estimasi hari yang valid!");
      return;
    }

    await supabase
      .from("projects")
      .update({
        status: "Development",
        estimate_days: parseInt(estimateDays),
        assigned_to: assignedTo.trim(),
        progress_percent: 0,
        checklist: [],
      })
      .eq("id", project.id);

    setAcceptModal({
      isOpen: false,
      project: null,
      estimateDays: "",
      assignedTo: "",
    });
    showAlert(
      `✅ Proyek "${project.project_title}" berhasil diaccept dan masuk Development!`,
    );
    fetchProjects();
  };

  const handleDeclinePending = async (proj) => {
    setModal({
      isOpen: true,
      type: "confirm",
      title: "Tolak Permintaan",
      message: `Apakah Anda yakin ingin menolak dan menghapus permintaan dari "${proj.client_name}" (${proj.project_title})?`,
      onConfirm: async () => {
        await supabase.from("projects").delete().eq("id", proj.id);
        fetchProjects();
        setModal({ ...modal, isOpen: false });
        showAlert("Permintaan telah ditolak dan dihapus.");
      },
    });
  };

  // ========== MODAL FUNCTIONS ==========
  const showAlert = (message) => {
    setModal({
      isOpen: true,
      type: "alert",
      title: "Informasi",
      message: message,
      onConfirm: () => setModal({ ...modal, isOpen: false }),
    });
  };

  const showConfirm = (title, message, onConfirm) => {
    setModal({
      isOpen: true,
      type: "confirm",
      title: title,
      message: message,
      onConfirm: () => {
        onConfirm();
        setModal({ ...modal, isOpen: false });
      },
    });
  };

  // ========== DEADLINE STATUS ==========
  const getDeadlineStatus = (createdAt, estimateDays) => {
    const deadline = new Date(
      new Date(createdAt).getTime() + estimateDays * 86400000,
    );
    const diff = deadline - new Date();
    const days = Math.ceil(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    if (diff <= 0) return { label: "EXPIRED", style: "bg-black text-white" };
    if (diff <= 86400000)
      return {
        label: `DANGER: ${hours} JAM LAGI`,
        style: "bg-red-600 text-white animate-pulse",
      };
    if (days <= 3)
      return {
        label: `WARNING: ${days} HARI LAGI`,
        style: "bg-yellow-500 text-white",
      };
    return { label: `${days} Hari Lagi`, style: "bg-blue-100 text-blue-900" };
  };

  // ========== INPUT CHANGE ==========
  const handleInputChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // ========== SUBMIT CATALOG ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saveStatus === "Uploading Image...")
      return showAlert("Tunggu upload selesai.");
    setIsSubmitting(true);
    const payload = {
      title: formData.title,
      category: formData.category,
      base_price: Number(formData.base_price) || 0,
      thumbnail_url: formData.thumbnail_url || "",
      preview_url: formData.preview_url || "",
      slug: formData.slug,
      description: formData.description || "",
      features: Array.isArray(formData.features)
        ? formData.features.join(", ")
        : "",
    };
    try {
      if (isEditing)
        await supabase.from("portfolios").update(payload).eq("id", editId);
      else await supabase.from("portfolios").insert([payload]);
      setFormData({
        title: "",
        category: "Corporate",
        base_price: "",
        thumbnail_url: "",
        preview_url: "",
        features: [],
        slug: "",
        description: "",
      });
      setIsEditing(false);
      fetchPortfolios();
      showAlert(
        isEditing
          ? "Katalog berhasil diupdate!"
          : "Katalog berhasil dipublish!",
      );
    } catch (err) {
      showAlert(err.message);
    }
    setIsSubmitting(false);
  };

  // ========== DELETE CATALOG ==========
  const handleDelete = async (id, title) => {
    showConfirm(
      "Hapus Katalog",
      `Apakah Anda yakin ingin menghapus "${title}" secara permanen?`,
      async () => {
        await supabase.from("portfolios").delete().eq("id", id);
        fetchPortfolios();
      },
    );
  };

  // ========== SUBMIT PROJECT ==========
  const handleProjectSubmit = async (e) => {
    e.preventDefault();

    if (!projectData.project_title) {
      showAlert("Silakan pilih catalog terlebih dahulu!");
      return;
    }

    setIsSubmitting(true);

    const featuresText = Array.isArray(projectData.features)
      ? projectData.features.join(", ")
      : "";

    const { error } = await supabase.from("projects").insert([
      {
        client_name: projectData.client_name,
        no_hp: projectData.no_hp,
        project_title: projectData.project_title,
        website_category: projectData.website_category,
        features: featuresText,
        price: Number(projectData.price) || 0,
        estimate_days: Number(projectData.estimate_days) || 0,
        assigned_to: projectData.assigned_to,
        status: "Development",
        progress_percent: 0,
        daily_task: "",
        checklist: [],
        notes: projectData.notes || "",
      },
    ]);

    if (error) showAlert("Error: " + error.message);
    else {
      setProjectData({
        client_name: "",
        no_hp: "",
        project_title: "",
        website_category: "Corporate",
        features: [],
        price: "",
        estimate_days: "",
        assigned_to: "",
        status: "Development",
        progress_percent: 0,
        daily_task: "",
        notes: "",
      });
      fetchProjects();
      showAlert("✅ Proyek berhasil ditambahkan ke Development!");
    }
    setIsSubmitting(false);
  };

  // ========== TOGGLE APPROVE ==========
  const toggleApprove = async (id, current) => {
    await supabase
      .from("testimonials")
      .update({ is_approved: !current })
      .eq("id", id);
    fetchTestimonials();
  };

  // ========== DELETE TESTIMONIAL ==========
  const handleDeleteTestimonial = async (id, name) => {
    showConfirm(
      "Hapus Testimonial",
      `Apakah Anda yakin ingin menghapus testimonial dari "${name}" secara permanen?`,
      async () => {
        const { error } = await supabase
          .from("testimonials")
          .delete()
          .eq("id", id);

        if (error) {
          showAlert("Gagal menghapus: " + error.message);
        } else {
          fetchTestimonials();
          showAlert("✅ Testimonial berhasil dihapus!");
        }
      },
    );
  };

  // ========== LOGOUT ==========
  const handleLogout = async () => {
    showConfirm(
      "Logout",
      "Apakah Anda yakin ingin keluar dari dashboard admin?",
      async () => {
        await supabase.auth.signOut();
        navigate("/login");
      },
    );
  };

  // ========== MARK AS DONE ==========
  const markAsDone = async (projId, clientName) => {
    showConfirm(
      "Selesaikan Proyek",
      `Apakah proyek "${clientName}" sudah selesai 100%?`,
      async () => {
        await supabase
          .from("projects")
          .update({ status: "Selesai", progress_percent: 100 })
          .eq("id", projId);
        showAlert("✅ Proyek Berhasil Diarsipkan ke Tab Finance!");
        fetchProjects();
      },
    );
  };

  // ========== DATA SPLITS ==========
  const pendingProjects = projects.filter((p) => p.status === "Pending");
  const archiveProjects = projects.filter((p) => p.status === "Selesai");

  const archiveByCategory = {
    "Landing Page": archiveProjects.filter(
      (p) => p.website_category === "Landing Page",
    ),
    Corporate: archiveProjects.filter(
      (p) => p.website_category === "Corporate",
    ),
    "E-Commerce": archiveProjects.filter(
      (p) => p.website_category === "E-Commerce",
    ),
    Portfolio: archiveProjects.filter(
      (p) => p.website_category === "Portfolio",
    ),
    Custom: archiveProjects.filter(
      (p) => !p.website_category || p.website_category === "Custom",
    ),
  };

  // ========== CHART COMPONENTS (ANALYTICS) ==========
  const CombinedChart = () => {
    const data = {
      labels: analyticsData.visitorsChartData.map((d) => d.date),
      datasets: [
        {
          label: "Pengunjung (Unique Session)",
          data: analyticsData.visitorsChartData.map((d) => d.visitors),
          backgroundColor: "rgba(59, 130, 246, 0.5)",
          borderColor: "rgb(59, 130, 246)",
          borderWidth: 2,
          tension: 0.3,
        },
        {
          label: "Pembeli (Order)",
          data: analyticsData.buyersChartData.map((d) => d.buyers),
          backgroundColor: "rgba(16, 185, 129, 0.5)",
          borderColor: "rgb(16, 185, 129)",
          borderWidth: 2,
          tension: 0.3,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        tooltip: { mode: "index", intersect: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: darkMode ? "#334155" : "#e2e8f0" },
        },
        x: { grid: { display: false } },
      },
    };

    return <Line data={data} options={options} />;
  };

  const DeviceChart = () => {
    const data = {
      labels: ["Mobile", "Tablet", "Desktop"],
      datasets: [
        {
          data: [
            analyticsData.deviceStats.mobile,
            analyticsData.deviceStats.tablet,
            analyticsData.deviceStats.desktop,
          ],
          backgroundColor: ["#3b82f6", "#06b6d4", "#10b981"],
          borderWidth: 0,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } },
    };

    return <Doughnut data={data} options={options} />;
  };

  const TrafficChart = () => {
    const data = {
      labels: ["Direct", "Google", "Social Media", "Referral"],
      datasets: [
        {
          label: "Sumber Traffic (Unique Session)",
          data: [
            analyticsData.trafficSources.direct,
            analyticsData.trafficSources.google,
            analyticsData.trafficSources.social,
            analyticsData.trafficSources.referral,
          ],
          backgroundColor: ["#3b82f6", "#ef4444", "#8b5cf6", "#f59e0b"],
          borderRadius: 8,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "top" } },
    };

    return <Bar data={data} options={options} />;
  };

  const RevenueChart = () => {
    if (!chartData || chartData.values.length === 0) {
      return (
        <p className="text-center text-slate-400 text-sm py-8">
          Belum ada data untuk ditampilkan
        </p>
      );
    }

    const maxValue = Math.max(...chartData.values);
    const colors = ["#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#f42b0c"];

    return (
      <div className="mt-6">
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">
          Revenue Chart by Category
        </p>
        <div className="space-y-3">
          {chartData.labels.map((label, idx) => {
            const percentage = (chartData.values[idx] / maxValue) * 100;
            return (
              <div key={label}>
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span className="text-slate-600">{label}</span>
                  <span className="text-blue-900">
                    Rp {chartData.values[idx].toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-6 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full flex items-center justify-end px-2 text-[8px] font-black text-white"
                    style={{
                      backgroundColor: colors[idx % colors.length],
                      width: `${percentage}%`,
                    }}
                  >
                    {percentage > 20 && `${Math.round(percentage)}%`}
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen font-['Poppins'] pb-20 transition-all duration-300 ${darkMode ? "dark bg-slate-900" : "bg-slate-50"}`}
    >
      <div className="max-w-7xl mx-auto px-8 pt-24">
        {/* Header with Dark Mode Toggle */}
        <div
          className={`flex justify-between items-end mb-10 sticky top-0 py-4 z-50 backdrop-blur-md ${darkMode ? "bg-slate-900/80 border-slate-700" : "bg-slate-50/80 border-slate-200/50"} border-b`}
        >
          <div>
            <h1
              className={`text-3xl font-black uppercase tracking-tighter italic ${darkMode ? "text-white" : "text-blue-900"}`}
            >
              Web Pro <span className="text-slate-400">Admin</span>
            </h1>
            <p className="text-[11px] font-bold text-blue-900 uppercase tracking-widest mt-1">
              IQ Corporation Control Center • v2.1.0 •{" "}
              <span className="text-green-500 font-black">{saveStatus}</span>
            </p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-2xl transition-all ${darkMode ? "bg-slate-800 text-yellow-400 hover:bg-slate-700" : "bg-white text-slate-600 hover:bg-slate-100"} border border-slate-200 shadow-sm`}
          >
            {darkMode ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Real-time Notification */}
        {showNotification && latestOrder && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50 bg-blue-900 text-white p-4 rounded-2xl shadow-2xl max-w-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-xl">
                📋
              </div>
              <div>
                <p className="font-black text-xs uppercase tracking-wider">
                  Permintaan Baru!
                </p>
                <p className="text-sm font-bold">{latestOrder.client_name}</p>
                <p className="text-[10px] opacity-75">
                  {latestOrder.project_title}
                </p>
                <button
                  onClick={() => {
                    setActiveTab("projects");
                    setShowNotification(false);
                  }}
                  className="mt-2 text-[9px] font-black bg-white text-blue-900 px-3 py-1 rounded-lg"
                >
                  Lihat Sekarang
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap justify-between items-center mb-10 gap-4">
          <div
            className={`flex gap-2 p-2 rounded-[2.5rem] w-fit border shadow-sm flex-wrap ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
          >
            {[
              "portfolio",
              "projects",
              "testimonials",
              "finance",
              "analytics",
              "backup",
              "waiting",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === "analytics") fetchAnalyticsData();
                  if (tab === "backup") loadBackupHistory();
                  if (tab === "waiting") fetchWaitingPayments();
                }}
                className={`px-6 py-3 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all relative ${activeTab === tab ? "text-white" : darkMode ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-blue-900"}`}
              >
                <span className="relative z-10">
                  {tab === "waiting"
                    ? "Menunggu Konfirmasi"
                    : tab === "portfolio"
                      ? "Catalog Management"
                      : tab === "projects"
                        ? `Production Line${pendingProjects.length > 0 ? ` (${pendingProjects.length} Pending)` : ""}`
                        : tab === "testimonials"
                          ? "Client Feedback"
                          : tab === "finance"
                            ? "Finance"
                            : tab === "analytics"
                              ? "Analytics"
                              : "Backup"}
                </span>
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-blue-900 rounded-[2rem] shadow-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-50 text-red-600 px-8 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-red-900 hover:text-white transition-all border border-red-100"
          >
            Logout System
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* ===================== TAB 1: CATALOG MANAGEMENT ===================== */}
            {activeTab === "portfolio" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-5">
                  <form
                    onSubmit={handleSubmit}
                    className={`p-10 rounded-[3rem] border shadow-sm sticky top-28 max-h-[80vh] overflow-y-auto ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
                  >
                    <h2
                      className={`font-black uppercase text-sm mb-8 tracking-widest ${darkMode ? "text-blue-400" : "text-blue-900"}`}
                    >
                      {isEditing ? "Update Template" : "New Catalog Item"}
                    </h2>
                    <div className="space-y-4">
                      <input
                        name="title"
                        value={formData.title || ""}
                        onChange={handleInputChange}
                        placeholder="Project Title"
                        className={`w-full p-4 rounded-2xl border-none text-sm font-bold shadow-inner ${darkMode ? "bg-slate-700 text-white placeholder:text-slate-400" : "bg-slate-50"}`}
                        required
                      />
                      <select
                        name="category"
                        value={formData.category || "Corporate"}
                        onChange={handleInputChange}
                        className={`w-full p-4 rounded-2xl border-none text-sm font-bold appearance-none shadow-inner cursor-pointer ${darkMode ? "bg-slate-700 text-white" : "bg-slate-50"}`}
                      >
                        <option>Landing Page</option>
                        <option>Corporate</option>
                        <option>E-Commerce</option>
                        <option>Portfolio</option>
                      </select>
                      <input
                        name="base_price"
                        type="number"
                        min="0"
                        value={formData.base_price || ""}
                        onChange={handleInputChange}
                        placeholder="Price (IDR)"
                        className={`w-full p-4 rounded-2xl border-none text-sm font-bold shadow-inner ${darkMode ? "bg-slate-700 text-white placeholder:text-slate-400" : "bg-slate-50"}`}
                        required
                      />
                      <div
                        className={`p-4 rounded-2xl border-2 border-dashed text-center ${darkMode ? "bg-slate-700 border-slate-600" : "bg-slate-50 border-slate-200"}`}
                      >
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">
                          Thumbnail Image
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="text-[10px] font-bold block w-full mx-auto"
                        />
                        {formData.thumbnail_url && (
                          <p className="text-[9px] text-green-600 font-bold mt-2 truncate">
                            ✓ {formData.thumbnail_url}
                          </p>
                        )}
                      </div>
                      <input
                        name="preview_url"
                        value={formData.preview_url || ""}
                        onChange={handleInputChange}
                        placeholder="Live Preview URL"
                        className={`w-full p-4 rounded-2xl border-none text-sm font-bold shadow-inner ${darkMode ? "bg-slate-700 text-white placeholder:text-slate-400" : "bg-slate-50"}`}
                        required
                      />
                      <input
                        name="slug"
                        value={formData.slug || ""}
                        onChange={handleInputChange}
                        placeholder="URL Slug (e.g. web-pro-01)"
                        className={`w-full p-4 rounded-2xl border-none text-sm font-bold shadow-inner ${darkMode ? "bg-slate-700 text-white placeholder:text-slate-400" : "bg-slate-50"}`}
                        required
                      />
                      <textarea
                        name="description"
                        value={formData.description || ""}
                        onChange={handleInputChange}
                        placeholder="Short Description..."
                        className={`w-full p-4 rounded-2xl border-none text-sm font-bold shadow-inner h-24 resize-none ${darkMode ? "bg-slate-700 text-white placeholder:text-slate-400" : "bg-slate-50"}`}
                      />

                      <div className="pt-2">
                        <label
                          className={`text-[10px] font-black uppercase ml-1 mb-3 block tracking-widest italic border-b pb-2 ${darkMode ? "text-blue-400 border-slate-700" : "text-blue-900 border-slate-100"}`}
                        >
                          Template Features Assignment
                        </label>

                        <div className="mb-3 border rounded-2xl overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setStandardOpen(!standardOpen)}
                            className="w-full p-3.5 flex justify-between items-center text-[10px] font-black text-blue-50 uppercase tracking-wider bg-blue-950"
                          >
                            <span>
                              Standard Features (
                              {Array.isArray(formData.features)
                                ? formData.features.filter((f) =>
                                    MASTER_STANDARD_FEATURES.includes(f),
                                  ).length
                                : 0}
                              /7)
                            </span>
                            <span>{standardOpen ? "▲" : "▼"}</span>
                          </button>
                          <AnimatePresence>
                            {standardOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className={`p-3 border-t space-y-2 ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
                              >
                                <div className="flex gap-2 mb-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSelectAllStandard(true)
                                    }
                                    className="flex-1 py-1.5 bg-blue-50 text-blue-900 font-black text-[9px] uppercase rounded-lg border border-blue-200"
                                  >
                                    Checklist Semua
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSelectAllStandard(false)
                                    }
                                    className="flex-1 py-1.5 bg-slate-50 text-slate-400 font-bold text-[9px] uppercase rounded-lg border border-slate-200"
                                  >
                                    Uncheck Semua
                                  </button>
                                </div>
                                {MASTER_STANDARD_FEATURES.map((feat) => {
                                  const checked =
                                    Array.isArray(formData.features) &&
                                    formData.features.includes(feat);
                                  return (
                                    <button
                                      type="button"
                                      key={feat}
                                      onClick={() =>
                                        handleFormFeatureToggle(feat)
                                      }
                                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${checked ? "bg-blue-50 border-blue-300 text-blue-900 font-bold" : darkMode ? "bg-slate-700 border-slate-600 text-slate-300" : "bg-slate-50/50 border-slate-100 text-slate-500"}`}
                                    >
                                      <div
                                        className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] flex-shrink-0 ${checked ? "bg-blue-900 text-white border-blue-900" : darkMode ? "bg-slate-600 border-slate-500" : "bg-white border-slate-300"}`}
                                      >
                                        {checked ? "✓" : ""}
                                      </div>
                                      <span className="text-[11px] uppercase tracking-tight">
                                        {feat}
                                      </span>
                                    </button>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="border rounded-2xl overflow-hidden">
                          <button
                            type="button"
                            onClick={() =>
                              setProfessionalOpen(!professionalOpen)
                            }
                            className={`w-full p-3.5 flex justify-between items-center text-[10px] font-black uppercase tracking-wider ${darkMode ? "bg-slate-700 text-blue-400" : "bg-slate-100/60 text-blue-900"}`}
                          >
                            <span>
                              Professional Features (
                              {Array.isArray(formData.features)
                                ? formData.features.filter((f) =>
                                    MASTER_PROFESSIONAL_FEATURES.includes(f),
                                  ).length
                                : 0}
                              /10)
                            </span>
                            <span>{professionalOpen ? "▲" : "▼"}</span>
                          </button>
                          <AnimatePresence>
                            {professionalOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className={`p-3 border-t space-y-2 ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
                              >
                                <div className="flex gap-2 mb-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSelectAllProfessional(true)
                                    }
                                    className="flex-1 py-1.5 bg-purple-50 text-purple-900 font-black text-[9px] uppercase rounded-lg border border-purple-200"
                                  >
                                    Checklist Semua
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSelectAllProfessional(false)
                                    }
                                    className="flex-1 py-1.5 bg-slate-50 text-slate-400 font-bold text-[9px] uppercase rounded-lg border border-slate-200"
                                  >
                                    Uncheck Semua
                                  </button>
                                </div>
                                {MASTER_PROFESSIONAL_FEATURES.map((feat) => {
                                  const checked =
                                    Array.isArray(formData.features) &&
                                    formData.features.includes(feat);
                                  return (
                                    <button
                                      type="button"
                                      key={feat}
                                      onClick={() =>
                                        handleFormFeatureToggle(feat)
                                      }
                                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${checked ? "bg-purple-50 border-purple-300 text-purple-900 font-bold" : darkMode ? "bg-slate-700 border-slate-600 text-slate-300" : "bg-slate-50/50 border-slate-100 text-slate-500"}`}
                                    >
                                      <div
                                        className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] flex-shrink-0 ${checked ? "bg-purple-900 text-white border-purple-900" : darkMode ? "bg-slate-600 border-slate-500" : "bg-white border-slate-300"}`}
                                      >
                                        {checked ? "✓" : ""}
                                      </div>
                                      <span className="text-[11px] uppercase tracking-tight">
                                        {feat}
                                      </span>
                                    </button>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-5 bg-blue-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-xl disabled:opacity-50 mt-4"
                      >
                        {isSubmitting
                          ? "Syncing..."
                          : isEditing
                            ? "Update Content"
                            : "Publish to Catalog"}
                      </button>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setFormData({
                              title: "",
                              category: "Corporate",
                              base_price: "",
                              thumbnail_url: "",
                              preview_url: "",
                              features: [],
                              slug: "",
                              description: "",
                            });
                          }}
                          className="w-full py-4 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-red-500 transition-all"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="lg:col-span-7 space-y-4">
                  {portfolios.map((p) => {
                    const count =
                      p.features &&
                      typeof p.features === "string" &&
                      p.features.trim() !== ""
                        ? p.features.split(",").length
                        : 0;
                    return (
                      <motion.div
                        layout
                        key={p.id}
                        className={`p-6 rounded-[2.5rem] border flex items-center justify-between hover:border-blue-200 transition-all shadow-sm ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
                      >
                        <div className="flex items-center gap-6 overflow-hidden">
                          <img
                            src={p.thumbnail_url}
                            className="w-20 h-20 rounded-3xl object-cover shadow-md flex-shrink-0 bg-slate-100"
                            alt=""
                          />
                          <div className="truncate">
                            <h3
                              className={`font-black uppercase text-sm italic truncate ${darkMode ? "text-white" : "text-slate-900"}`}
                            >
                              {p.title}
                            </h3>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                              {p.category} • Rp{" "}
                              {parseInt(p.base_price || 0).toLocaleString()}
                            </p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">
                              Features: {count}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => {
                              const parsed =
                                typeof p.features === "string" &&
                                p.features.trim() !== ""
                                  ? p.features.split(",").map((f) => f.trim())
                                  : Array.isArray(p.features)
                                    ? p.features
                                    : [];
                              setFormData({ ...p, features: parsed });
                              setEditId(p.id);
                              setIsEditing(true);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="p-4 rounded-2xl bg-blue-50 text-slate-400 hover:bg-blue-900 hover:text-white transition-all"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.title)}
                            className="p-4 rounded-2xl bg-red-50 text-slate-400 hover:bg-red-900 hover:text-white transition-all"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ===================== TAB 2: PRODUCTION LINE ===================== */}
            {activeTab === "projects" && (
              <div className="space-y-16">
                {pendingProjects.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <span className="px-4 py-2 bg-yellow-400 text-yellow-900 font-black text-[10px] uppercase tracking-widest rounded-xl animate-pulse">
                        ⚡ {pendingProjects.length} Permintaan Masuk
                      </span>
                      <span className="text-slate-400 text-[11px] font-bold">
                        Tinjau & putuskan Accept atau Decline
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      {pendingProjects.map((proj) => {
                        const feats =
                          proj.features &&
                          typeof proj.features === "string" &&
                          proj.features.trim() !== ""
                            ? proj.features.split(",").map((f) => f.trim())
                            : [];
                        const stdFeats = feats.filter((f) =>
                          MASTER_STANDARD_FEATURES.includes(f),
                        );
                        const proFeats = feats.filter(
                          (f) => !MASTER_STANDARD_FEATURES.includes(f),
                        );
                        return (
                          <motion.div
                            key={proj.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`border-2 border-yellow-300 rounded-[3rem] p-8 shadow-lg shadow-yellow-100/50 relative overflow-hidden ${darkMode ? "bg-slate-800" : "bg-white"}`}
                          >
                            <div className="absolute top-0 right-0 px-6 py-2.5 bg-yellow-400 text-yellow-900 font-black text-[9px] uppercase tracking-widest rounded-bl-3xl">
                              PENDING REVIEW
                            </div>

                            <div className="mt-4 mb-6">
                              <h3
                                className={`font-black text-lg uppercase tracking-tighter italic ${darkMode ? "text-white" : "text-slate-900"}`}
                              >
                                {proj.client_name}
                              </h3>
                              <p className="text-blue-600 font-bold text-[10px] uppercase tracking-widest mt-1">
                                {proj.project_title} • {proj.website_category}
                              </p>
                              <div className="flex flex-wrap gap-3 mt-3">
                                <span className="text-[10px] font-black text-slate-600 flex items-center gap-1.5">
                                  📱 {proj.no_hp || "-"}
                                </span>
                                <span className="text-[10px] font-black text-blue-900 flex items-center gap-1.5">
                                  💰 Rp{" "}
                                  {Number(proj.price || 0).toLocaleString()}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                                  🕐{" "}
                                  {new Date(proj.created_at).toLocaleString(
                                    "id-ID",
                                    { dateStyle: "medium", timeStyle: "short" },
                                  )}
                                </span>
                              </div>
                              {proj.notes && (
                                <div className="mt-3 p-3 bg-slate-100 rounded-xl text-[10px] font-medium text-slate-600">
                                  <span className="font-black">
                                    📝 Catatan:
                                  </span>{" "}
                                  {proj.notes}
                                </div>
                              )}
                            </div>

                            <div
                              className={`rounded-2xl p-4 mb-6 space-y-2 max-h-40 overflow-y-auto ${darkMode ? "bg-slate-700" : "bg-slate-50"}`}
                            >
                              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">
                                Features Diminta
                              </p>
                              {stdFeats.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  <span className="text-[9px] font-black bg-blue-900 text-white px-2.5 py-1 rounded-lg">
                                    ✓ Standard Features ({stdFeats.length})
                                  </span>
                                </div>
                              )}
                              {proFeats.map((f, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-2 text-[10px] font-bold text-purple-800"
                                >
                                  <span className="text-purple-500">★</span> {f}
                                </div>
                              ))}
                              {feats.length === 0 && (
                                <p className="text-[10px] text-slate-400 italic">
                                  Tidak ada features
                                </p>
                              )}
                            </div>

                            <div className="flex gap-3">
                              <button
                                onClick={() => handleAcceptPending(proj)}
                                className="flex-1 py-4 bg-blue-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg"
                              >
                                ✓ Accept
                              </button>
                              <button
                                onClick={() => handleDeclinePending(proj)}
                                className="flex-1 py-4 bg-red-50 text-red-600 border-2 border-red-100 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-red-900 hover:text-white transition-all"
                              >
                                ✕ Decline
                              </button>
                            </div>

                            {proj.no_hp && (
                              <a
                                href={`https://wa.me/${proj.no_hp.replace(/^0/, "62").replace(/\D/g, "")}?text=Halo%20${encodeURIComponent(proj.client_name)}%2C%20permintaan%20website%20Anda%20(${encodeURIComponent(proj.project_title)})%20sudah%20kami%20terima.%20Kami%20siap%20membahas%20lebih%20lanjut!`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 w-full flex items-center justify-center gap-2 py-3 bg-green-50 text-green-700 border border-green-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  fill="currentColor"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592z" />
                                </svg>
                                Hubungi via WhatsApp
                              </a>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                    <hr
                      className={`my-8 ${darkMode ? "border-slate-700" : "border-slate-200"}`}
                    />
                  </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-4">
                    <form
                      onSubmit={handleProjectSubmit}
                      className={`p-10 rounded-[3rem] border shadow-sm sticky top-28 max-h-[85vh] overflow-y-auto ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
                    >
                      <h2
                        className={`font-black uppercase text-sm mb-8 tracking-widest ${darkMode ? "text-blue-600" : "text-blue-900"}`}
                      >
                        Register New Client
                      </h2>
                      <div className="space-y-4">
                        <input
                          value={projectData.client_name || ""}
                          onChange={(e) =>
                            setProjectData({
                              ...projectData,
                              client_name: e.target.value,
                            })
                          }
                          placeholder="Nama Client"
                          className={`w-full p-4 rounded-2xl border-none text-sm font-bold shadow-inner ${darkMode ? "bg-slate-700 text-white placeholder:text-slate-400" : "bg-slate-50"}`}
                          required
                        />
                        <input
                          value={projectData.no_hp || ""}
                          onChange={(e) =>
                            setProjectData({
                              ...projectData,
                              no_hp: e.target.value,
                            })
                          }
                          placeholder="No. WhatsApp Client"
                          className={`w-full p-4 rounded-2xl border-none text-sm font-bold shadow-inner ${darkMode ? "bg-slate-700 text-white placeholder:text-slate-400" : "bg-slate-50"}`}
                          required
                        />

                        <select
                          value={projectData.project_title || ""}
                          onChange={handleCatalogSync}
                          className={`w-full p-4 rounded-2xl border-none text-sm font-bold appearance-none shadow-inner cursor-pointer ${darkMode ? "bg-slate-700 text-white" : "bg-slate-50"}`}
                        >
                          <option value="">-- Choose From Catalog --</option>
                          <optgroup label="1. LANDING PAGE">
                            {portfolios
                              .filter((p) => p.category === "Landing Page")
                              .map((p) => (
                                <option key={p.id} value={p.title}>
                                  {p.title}
                                </option>
                              ))}
                          </optgroup>
                          <optgroup label="2. CORPORATE">
                            {portfolios
                              .filter((p) => p.category === "Corporate")
                              .map((p) => (
                                <option key={p.id} value={p.title}>
                                  {p.title}
                                </option>
                              ))}
                          </optgroup>
                          <optgroup label="3. E-COMMERCE">
                            {portfolios
                              .filter((p) => p.category === "E-Commerce")
                              .map((p) => (
                                <option key={p.id} value={p.title}>
                                  {p.title}
                                </option>
                              ))}
                          </optgroup>
                          <optgroup label="4. PORTFOLIO">
                            {portfolios
                              .filter((p) => p.category === "Portfolio")
                              .map((p) => (
                                <option key={p.id} value={p.title}>
                                  {p.title}
                                </option>
                              ))}
                          </optgroup>
                          <optgroup label="5. CUSTOM OPTIONS">
                            <option value="CUSTOM_PROJECT">
                              ★ Buat Proyek Custom
                            </option>
                          </optgroup>
                        </select>

                        {projectData.project_title ===
                          "Custom Project Development" && (
                          <div
                            className={`border rounded-2xl p-4 space-y-3 ${darkMode ? "border-slate-600 bg-slate-700/30" : "border-slate-200 bg-slate-50/30"}`}
                          >
                            <p className="text-[9px] font-black uppercase text-purple-600 tracking-wider">
                              Custom Features Selection
                            </p>
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                              <div>
                                <p className="text-[8px] font-bold text-blue-800 mb-2">
                                  STANDARD FEATURES (Wajib untuk semua proyek)
                                </p>
                                <div className="flex gap-2 mb-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSelectAllCustomStandard(
                                        true,
                                        projectData.features,
                                      )
                                    }
                                    className="text-[8px] px-2 py-1 bg-blue-50 rounded-lg"
                                  >
                                    Select All Standard
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSelectAllCustomStandard(
                                        false,
                                        projectData.features,
                                      )
                                    }
                                    className="text-[8px] px-2 py-1 bg-slate-50 rounded-lg"
                                  >
                                    Clear All Standard
                                  </button>
                                </div>
                                {MASTER_STANDARD_FEATURES.map((feat) => {
                                  const checked =
                                    Array.isArray(projectData.features) &&
                                    projectData.features.includes(feat);
                                  return (
                                    <label
                                      key={feat}
                                      className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-white transition-all"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() =>
                                          handleCustomFeatureToggle(
                                            feat,
                                            projectData.features,
                                          )
                                        }
                                        className="w-4 h-4"
                                      />
                                      <span className="text-[10px] font-medium">
                                        {feat}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                              <div className="border-t pt-3">
                                <p className="text-[8px] font-bold text-purple-800 mb-2">
                                  PROFESSIONAL FEATURES (Optional)
                                </p>
                                <div className="flex gap-2 mb-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSelectAllCustomProfessional(
                                        true,
                                        projectData.features,
                                      )
                                    }
                                    className="text-[8px] px-2 py-1 bg-purple-50 rounded-lg"
                                  >
                                    Select All Professional
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSelectAllCustomProfessional(
                                        false,
                                        projectData.features,
                                      )
                                    }
                                    className="text-[8px] px-2 py-1 bg-slate-50 rounded-lg"
                                  >
                                    Clear All Professional
                                  </button>
                                </div>
                                {MASTER_PROFESSIONAL_FEATURES.map((feat) => {
                                  const checked =
                                    Array.isArray(projectData.features) &&
                                    projectData.features.includes(feat);
                                  return (
                                    <label
                                      key={feat}
                                      className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-white transition-all"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() =>
                                          handleCustomFeatureToggle(
                                            feat,
                                            projectData.features,
                                          )
                                        }
                                        className="w-4 h-4"
                                      />
                                      <span className="text-[10px] font-medium">
                                        {feat}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        <input
                          value={projectData.price || ""}
                          onChange={(e) =>
                            setProjectData({
                              ...projectData,
                              price: e.target.value,
                            })
                          }
                          type="number"
                          min="0"
                          placeholder="Agreed Price"
                          className={`w-full p-4 rounded-2xl border-none text-sm font-bold shadow-inner ${darkMode ? "bg-slate-700 text-white placeholder:text-slate-400" : "bg-slate-50"}`}
                          required
                        />
                        <input
                          value={projectData.estimate_days || ""}
                          onChange={(e) =>
                            setProjectData({
                              ...projectData,
                              estimate_days: e.target.value,
                            })
                          }
                          type="number"
                          min="1"
                          placeholder="Estimate Days"
                          className={`w-full p-4 rounded-2xl border-none text-sm font-bold shadow-inner ${darkMode ? "bg-slate-700 text-white placeholder:text-slate-400" : "bg-slate-50"}`}
                          required
                        />
                        <input
                          value={projectData.assigned_to || ""}
                          onChange={(e) =>
                            setProjectData({
                              ...projectData,
                              assigned_to: e.target.value,
                            })
                          }
                          placeholder="Developer / PIC"
                          className={`w-full p-4 rounded-2xl border-none text-sm font-bold shadow-inner ${darkMode ? "bg-slate-700 text-white placeholder:text-slate-400" : "bg-slate-50"}`}
                          required
                        />
                        <textarea
                          value={projectData.notes || ""}
                          onChange={(e) =>
                            setProjectData({
                              ...projectData,
                              notes: e.target.value,
                            })
                          }
                          placeholder="Catatan khusus / requirement tambahan..."
                          className={`w-full p-4 rounded-2xl border-none text-sm font-bold shadow-inner h-24 resize-none ${darkMode ? "bg-slate-700 text-white placeholder:text-slate-400" : "bg-slate-50"}`}
                        />

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-5 bg-blue-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-xl disabled:opacity-50"
                        >
                          {isSubmitting
                            ? "Processing..."
                            : "Deploy to Development"}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="lg:col-span-8 space-y-6">
                    {/* Filter & Search Bar */}
                    <div
                      className={`flex flex-wrap gap-4 items-center p-4 rounded-2xl ${darkMode ? "bg-slate-800" : "bg-white"} border ${darkMode ? "border-slate-700" : "border-slate-200"} shadow-sm`}
                    >
                      <div className="flex-1 min-w-[200px]">
                        <input
                          type="text"
                          placeholder="🔍 Cari client atau proyek..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className={`w-full p-3 rounded-xl border text-sm font-medium ${darkMode ? "bg-slate-700 border-slate-600 text-white placeholder:text-slate-400" : "bg-white border-slate-200"}`}
                        />
                      </div>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className={`p-3 rounded-xl border text-sm font-medium ${darkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-200"}`}
                      >
                        <option value="all">Semua Kategori</option>
                        <option value="Landing Page">Landing Page</option>
                        <option value="Corporate">Corporate</option>
                        <option value="E-Commerce">E-Commerce</option>
                        <option value="Portfolio">Portfolio</option>
                        <option value="Custom">Custom</option>
                      </select>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={`p-3 rounded-xl border text-sm font-medium ${darkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-200"}`}
                      >
                        <option value="all">Semua Status</option>
                        <option value="Development">Development</option>
                      </select>
                    </div>

                    {filteredActiveProjects.length === 0 ? (
                      <div
                        className={`border-2 border-dashed rounded-[3.5rem] p-20 flex flex-col items-center justify-center text-center ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
                      >
                        <h3
                          className={`font-black uppercase italic tracking-tighter text-xl ${darkMode ? "text-slate-400" : "text-slate-400"}`}
                        >
                          Production Line Empty
                        </h3>
                        <p className="text-slate-300 text-sm mt-2 font-medium">
                          {searchTerm ||
                          categoryFilter !== "all" ||
                          statusFilter !== "all"
                            ? "Tidak ada proyek yang sesuai dengan filter"
                            : "Belum ada proyek aktif saat ini."}
                        </p>
                      </div>
                    ) : (
                      filteredActiveProjects.map((proj) => {
                        const deadline = getDeadlineStatus(
                          proj.created_at,
                          proj.estimate_days,
                        );
                        const feats =
                          proj.features &&
                          typeof proj.features === "string" &&
                          proj.features.trim() !== ""
                            ? proj.features.split(",").map((f) => f.trim())
                            : [];
                        const checklist = Array.isArray(proj.checklist)
                          ? proj.checklist
                          : [];
                        const ready =
                          feats.length > 0 && checklist.length === feats.length;

                        return (
                          <div
                            key={proj.id}
                            className={`p-10 rounded-[3.5rem] border shadow-sm relative overflow-hidden ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
                          >
                            <div
                              className={`absolute top-0 right-0 px-8 py-3 font-black text-[9px] uppercase tracking-widest rounded-bl-3xl z-10 ${deadline.style}`}
                            >
                              {deadline.label}
                            </div>

                            <div className="grid lg:grid-cols-2 gap-10">
                              <div>
                                <h3
                                  className={`font-black uppercase text-lg italic tracking-tighter truncate ${darkMode ? "text-white" : "text-slate-900"}`}
                                >
                                  {proj.client_name}
                                </h3>
                                <div className="flex flex-wrap gap-3 mb-1 mt-1">
                                  <p className="text-blue-600 font-bold text-[10px] uppercase tracking-widest">
                                    {proj.project_title} •{" "}
                                    {proj.website_category}
                                  </p>
                                </div>
                                <div className="flex flex-wrap gap-3 mb-6">
                                  {proj.no_hp && (
                                    <a
                                      href={`https://wa.me/${proj.no_hp.replace(/^0/, "62").replace(/\D/g, "")}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[9px] font-black text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-lg hover:bg-green-600 hover:text-white transition-all"
                                    >
                                      📱 {proj.no_hp}
                                    </a>
                                  )}
                                  <span className="text-[9px] font-black text-blue-900 bg-blue-50 border border-blue-100 px-3 py-1 rounded-lg">
                                    💰 Rp{" "}
                                    {Number(proj.price || 0).toLocaleString()}
                                  </span>
                                  {proj.assigned_to && (
                                    <span className="text-[9px] font-black text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg">
                                      👤 {proj.assigned_to}
                                    </span>
                                  )}
                                </div>
                                {proj.notes && (
                                  <div className="mb-4 p-3 bg-slate-100 rounded-xl text-[10px] font-medium text-slate-600">
                                    <span className="font-black">
                                      📝 Catatan:
                                    </span>{" "}
                                    {proj.notes}
                                  </div>
                                )}

                                <div
                                  className={`p-6 rounded-[2.5rem] border mb-6 shadow-inner max-h-[450px] overflow-y-auto ${darkMode ? "bg-slate-700 border-slate-600" : "bg-slate-50 border-slate-100"}`}
                                >
                                  <p className="text-[9px] font-black uppercase text-slate-400 mb-4 tracking-widest">
                                    Feature Verification Checklist
                                  </p>
                                  <div className="grid grid-cols-1 gap-2">
                                    {feats.length > 0 ? (
                                      feats.map((item) => (
                                        <label
                                          key={item}
                                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${checklist.includes(item) ? "bg-blue-900 border-blue-900 text-white shadow-md" : darkMode ? "bg-slate-800 border-slate-600 text-slate-300 hover:border-blue-400" : "bg-white border-slate-100 text-slate-500 hover:border-blue-400"}`}
                                        >
                                          <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={checklist.includes(item)}
                                            onChange={() =>
                                              handleChecklistToggle(
                                                proj.id,
                                                item,
                                                proj.checklist,
                                                feats.length,
                                              )
                                            }
                                          />
                                          <div
                                            className={`w-4 h-4 rounded flex items-center justify-center border text-[9px] flex-shrink-0 ${checklist.includes(item) ? "bg-white text-blue-900 border-white" : darkMode ? "bg-slate-700 border-slate-500" : "border-slate-300 bg-white"}`}
                                          >
                                            {checklist.includes(item)
                                              ? "✓"
                                              : ""}
                                          </div>
                                          <span className="text-[10px] font-bold uppercase">
                                            {item}
                                          </span>
                                        </label>
                                      ))
                                    ) : (
                                      <p className="text-[10px] text-slate-400 italic text-center py-4">
                                        No features loaded.
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-3">
                                  <input
                                    className={`flex-1 p-4 rounded-2xl text-xs font-bold border-none shadow-inner ${darkMode ? "bg-slate-700 text-white" : "bg-slate-50"}`}
                                    placeholder="Today's task..."
                                    defaultValue={proj.daily_task || ""}
                                    onBlur={(e) =>
                                      updateDailyTask(proj.id, e.target.value)
                                    }
                                  />
                                  <button
                                    onClick={() => printInvoice(proj)}
                                    className="px-4 py-2 bg-blue-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-800 transition-all"
                                    title="Cetak Invoice"
                                  >
                                    🖨️
                                  </button>
                                </div>
                              </div>

                              <div className="flex flex-col justify-center bg-blue-50/20 rounded-[3rem] p-8 border border-blue-50">
                                <div className="flex justify-between mb-3 px-2">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 italic">
                                    Build Integrity
                                  </span>
                                  <span className="text-[10px] font-black text-blue-900">
                                    {Math.round(proj.progress_percent || 0)}%
                                  </span>
                                </div>
                                <div className="w-full h-4 bg-white rounded-full overflow-hidden shadow-inner border p-1">
                                  <motion.div
                                    animate={{
                                      width: `${proj.progress_percent || 0}%`,
                                    }}
                                    className="h-full bg-blue-900 rounded-full shadow-lg"
                                  />
                                </div>
                                <button
                                  disabled={!ready}
                                  onClick={() =>
                                    markAsDone(proj.id, proj.client_name)
                                  }
                                  className={`mt-10 py-5 rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest italic transition-all shadow-xl ${ready ? "bg-blue-900 text-white hover:bg-green-600 scale-105" : "bg-slate-200 text-slate-400 cursor-not-allowed opacity-50"}`}
                                >
                                  {ready
                                    ? "Archive & Finalize Project"
                                    : `Task Checklist (${checklist.length}/${feats.length})`}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}

                    {archiveProjects.length > 0 && (
                      <div className="mt-8">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">
                          ✅ Completed Archive ({archiveProjects.length})
                        </p>
                        <div className="space-y-6">
                          {Object.entries(archiveByCategory).map(
                            ([category, categoryProjects]) =>
                              categoryProjects.length > 0 && (
                                <div key={category}>
                                  <h4 className="text-[11px] font-black text-blue-900 uppercase mb-3 border-b border-blue-200 pb-1">
                                    {category} ({categoryProjects.length})
                                  </h4>
                                  <div className="space-y-3">
                                    {categoryProjects.map((proj) => {
                                      const feats =
                                        proj.features &&
                                        typeof proj.features === "string"
                                          ? proj.features
                                              .split(",")
                                              .map((f) => f.trim())
                                          : [];
                                      const deadline = getDeadlineStatus(
                                        proj.created_at,
                                        proj.estimate_days,
                                      );
                                      return (
                                        <div
                                          key={proj.id}
                                          className={`rounded-[2rem] border shadow-sm overflow-hidden ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
                                        >
                                          <div className="p-6 flex items-center justify-between">
                                            <div>
                                              <h4
                                                className={`font-black uppercase text-sm italic ${darkMode ? "text-blue-400" : "text-blue-900"}`}
                                              >
                                                {proj.client_name}
                                              </h4>
                                              <p
                                                className={`font-bold text-[10px] uppercase ${darkMode ? "text-slate-300" : "text-slate-600"}`}
                                              >
                                                {proj.project_title}
                                              </p>
                                              {proj.no_hp && (
                                                <p className="text-slate-400 text-[9px] font-bold">
                                                  📱 {proj.no_hp}
                                                </p>
                                              )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                              <span className="px-4 py-2 bg-green-100 text-green-700 font-black text-[9px] uppercase rounded-xl">
                                                ✓ Selesai
                                              </span>
                                              <button
                                                onClick={() =>
                                                  setExpandedArchive(
                                                    expandedArchive === proj.id
                                                      ? null
                                                      : proj.id,
                                                  )
                                                }
                                                className={`p-2 rounded-xl transition-all ${darkMode ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-100 hover:bg-slate-200"}`}
                                              >
                                                <svg
                                                  className={`w-5 h-5 transition-transform ${expandedArchive === proj.id ? "rotate-180" : ""}`}
                                                  fill="none"
                                                  stroke="currentColor"
                                                  viewBox="0 0 24 24"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 9l-7 7-7-7"
                                                  />
                                                </svg>
                                              </button>
                                            </div>
                                          </div>

                                          {expandedArchive === proj.id && (
                                            <motion.div
                                              initial={{
                                                height: 0,
                                                opacity: 0,
                                              }}
                                              animate={{
                                                height: "auto",
                                                opacity: 1,
                                              }}
                                              exit={{ height: 0, opacity: 0 }}
                                              className={`border-t p-6 ${darkMode ? "border-slate-700 bg-slate-700/50" : "border-slate-100 bg-slate-50/50"}`}
                                            >
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                  <p className="text-[9px] font-black text-slate-400 uppercase">
                                                    Detail Proyek
                                                  </p>
                                                  <p className="text-[11px] mt-1">
                                                    <span className="font-bold">
                                                      Developer:
                                                    </span>{" "}
                                                    {proj.assigned_to || "-"}
                                                  </p>
                                                  <p className="text-[11px]">
                                                    <span className="font-bold">
                                                      Estimasi:
                                                    </span>{" "}
                                                    {proj.estimate_days} hari
                                                  </p>
                                                  <p className="text-[11px]">
                                                    <span className="font-bold">
                                                      Deadline:
                                                    </span>{" "}
                                                    {deadline.label}
                                                  </p>
                                                  <p className="text-[11px]">
                                                    <span className="font-bold">
                                                      Tanggal Selesai:
                                                    </span>{" "}
                                                    {new Date(
                                                      proj.updated_at ||
                                                        proj.created_at,
                                                    ).toLocaleDateString(
                                                      "id-ID",
                                                    )}
                                                  </p>
                                                </div>
                                                <div>
                                                  <p className="text-[9px] font-black text-slate-400 uppercase">
                                                    Features
                                                  </p>
                                                  <div className="flex flex-wrap gap-1 mt-1">
                                                    {feats.map((f, i) => (
                                                      <span
                                                        key={i}
                                                        className={`text-[9px] font-medium px-2 py-0.5 rounded border ${darkMode ? "bg-slate-800 border-slate-600 text-slate-300" : "bg-white border-slate-200"}`}
                                                      >
                                                        {f}
                                                      </span>
                                                    ))}
                                                  </div>
                                                </div>
                                              </div>
                                              <button
                                                onClick={() =>
                                                  printInvoice(proj)
                                                }
                                                className="mt-4 px-4 py-2 bg-blue-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-800 transition-all"
                                              >
                                                🖨️ Cetak Invoice
                                              </button>
                                            </motion.div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ===================== TAB 3: TESTIMONIALS ===================== */}
            {activeTab === "testimonials" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-6 px-2">
                  <h2
                    className={`font-black uppercase text-xs tracking-widest ${darkMode ? "text-white" : "text-slate-900"}`}
                  >
                    Public Testimonials Queue
                  </h2>
                  <span
                    className={`text-[9px] font-black px-3 py-1 rounded-full ${darkMode ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-500"}`}
                  >
                    Total: {testimonials.length}
                  </span>
                </div>

                {testimonials.length === 0 ? (
                  <div
                    className={`text-center py-20 rounded-[3rem] border ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
                  >
                    <div className="text-5xl mb-4">📝</div>
                    <p
                      className={`text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                    >
                      Belum ada testimonial yang masuk
                    </p>
                  </div>
                ) : (
                  testimonials.map((t) => (
                    <div
                      key={t.id}
                      className={`p-8 rounded-[3rem] border flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm transition-all hover:shadow-md ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
                    >
                      <div className="flex-grow">
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < (t.rating || 5) ? "text-yellow-400" : "text-slate-200"}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span
                            className={`ml-2 text-[9px] font-black ${t.is_approved ? "text-green-600" : "text-yellow-500"}`}
                          >
                            {t.is_approved ? "✓ Approved" : "⏳ Pending"}
                          </span>
                        </div>
                        <h3
                          className={`font-black uppercase italic text-sm ${darkMode ? "text-white" : "text-slate-900"}`}
                        >
                          {t.name}{" "}
                          <span className="text-blue-900 text-xs ml-2 normal-case opacity-60">
                            / {t.role}
                          </span>
                        </h3>
                        <p className="text-slate-500 italic text-sm mt-3 leading-relaxed">
                          "{t.comment || ""}"
                        </p>
                        <p className="text-[9px] text-slate-400 mt-3">
                          📅{" "}
                          {new Date(t.created_at).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => toggleApprove(t.id, t.is_approved)}
                          className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all flex-shrink-0 ${t.is_approved ? "bg-green-50 text-green-600 border border-green-200 hover:bg-green-600 hover:text-white" : "bg-blue-900 text-white hover:bg-blue-800"}`}
                        >
                          {t.is_approved ? "✓ Approved" : "Approve"}
                        </button>
                        <button
                          onClick={() => handleDeleteTestimonial(t.id, t.name)}
                          className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all flex-shrink-0 bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ===================== TAB 4: FINANCE ===================== */}
            {activeTab === "finance" && (
              <div className="space-y-8">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div className="bg-blue-900 px-6 py-4 rounded-2xl shadow-lg">
                    <h2 className="text-blue-50 font-black text-sm uppercase tracking-widest">
                      IQ CORPORATION FINANCE
                    </h2>
                    <p className="text-blue-100 text-[8px] font-bold uppercase tracking-wider mt-1">
                      Financial Management System
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={exportToExcel}
                      className="px-5 py-3 bg-green-600 text-white rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-green-700 transition-all shadow-md flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Export Excel
                    </button>
                    <button
                      onClick={exportToPDF}
                      className="px-5 py-3 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-red-700 transition-all shadow-md flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      Export PDF
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-950 to-blue-900 rounded-[2.5rem] p-8 text-center text-white shadow-lg hover:shadow-blue-950 transition hover:scale-[1.01]">
                    <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest">
                      Total Revenue
                    </p>
                    <p className="text-4xl font-black tracking-tighter my-12">
                      Rp {totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-blue-200 text-[9px]">
                      Dari {completedProjects.length} Proyek Selesai
                    </p>
                  </div>
                  <div
                    className={`rounded-[2.5rem] p-8 border shadow-sm ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
                  >
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">
                      Breakdown per Kategori
                    </p>
                    <div className="space-y-3">
                      {Object.entries(categoryBreakdown).map(
                        ([cat, amount]) =>
                          amount > 0 && (
                            <div
                              key={cat}
                              className="flex justify-between items-center"
                            >
                              <span
                                className={`text-[11px] font-bold ${darkMode ? "text-slate-300" : "text-slate-600"}`}
                              >
                                {cat}
                              </span>
                              <span className="text-[11px] font-black text-blue-900">
                                Rp {amount.toLocaleString()}
                              </span>
                            </div>
                          ),
                      )}
                    </div>
                  </div>
                  <div
                    className={`rounded-[2.5rem] p-8 border shadow-sm ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
                  >
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">
                      Statistik
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span
                          className={`text-[11px] font-bold ${darkMode ? "text-slate-300" : "text-slate-600"}`}
                        >
                          Rata-rata per Proyek
                        </span>
                        <span className="text-[11px] font-black text-blue-900">
                          Rp{" "}
                          {completedProjects.length > 0
                            ? Math.floor(
                                totalRevenue / completedProjects.length,
                              ).toLocaleString()
                            : 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span
                          className={`text-[11px] font-bold ${darkMode ? "text-slate-300" : "text-slate-600"}`}
                        >
                          Proyek Tertinggi
                        </span>
                        <span className="text-[11px] font-black text-green-600">
                          Rp{" "}
                          {Math.max(
                            ...completedProjects.map(
                              (p) => Number(p.price) || 0,
                            ),
                            0,
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`rounded-[2.5rem] p-8 border shadow-sm ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
                >
                  <RevenueChart />
                </div>

                <div
                  className={`rounded-[2.5rem] border shadow-sm overflow-hidden ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
                >
                  <div
                    className={`px-8 py-6 border-b ${darkMode ? "border-slate-700" : "border-slate-100"}`}
                  >
                    <h3
                      className={`font-black uppercase text-sm tracking-widest ${darkMode ? "text-white" : "text-slate-900"}`}
                    >
                      Daftar Transaksi
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead
                        className={darkMode ? "bg-slate-700" : "bg-slate-50"}
                      >
                        <tr>
                          <th className="text-left p-5 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                            Client
                          </th>
                          <th className="text-left p-5 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                            Project
                          </th>
                          <th className="text-left p-5 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                            Kategori
                          </th>
                          <th className="text-left p-5 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="text-left p-5 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                            Selesai
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {completedProjects.map((proj) => (
                          <tr
                            key={proj.id}
                            className={`hover:bg-slate-50/50 transition-all ${darkMode ? "hover:bg-slate-700" : ""}`}
                          >
                            <td className="p-5">
                              <p
                                className={`font-black text-sm ${darkMode ? "text-white" : "text-slate-800"}`}
                              >
                                {proj.client_name}
                              </p>
                              {proj.no_hp && (
                                <p className="text-[9px] text-slate-400">
                                  {proj.no_hp}
                                </p>
                              )}
                            </td>
                            <td className="p-5">
                              <p
                                className={`font-bold text-[11px] ${darkMode ? "text-slate-300" : "text-slate-700"}`}
                              >
                                {proj.project_title}
                              </p>
                            </td>
                            <td className="p-5">
                              <span className="text-[9px] font-black px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                                {proj.website_category || "Custom"}
                              </span>
                            </td>
                            <td className="p-5">
                              <span className="font-black text-blue-900">
                                Rp {Number(proj.price || 0).toLocaleString()}
                              </span>
                            </td>
                            <td className="p-5">
                              <span className="text-[9px] text-green-600">
                                {new Date(
                                  proj.updated_at || proj.created_at,
                                ).toLocaleDateString("id-ID")}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {completedProjects.length === 0 && (
                          <tr>
                            <td
                              colSpan="5"
                              className="p-16 text-center text-slate-400 italic font-medium"
                            >
                              Belum ada transaksi selesai
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ===================== TAB 5: ANALYTICS ===================== */}
            {activeTab === "analytics" && (
              <div className="space-y-8">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div className="bg-blue-900 px-6 py-4 rounded-2xl shadow-lg">
                    <h2 className="text-blue-50 font-black text-sm uppercase tracking-widest">
                      WEBSITE ANALYTICS
                    </h2>
                    <p className="text-blue-100 text-[8px] font-bold uppercase tracking-wider mt-1">
                      Statistik Pengunjung & Pembeli
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className={`p-2 rounded-xl border text-[10px] font-bold ${darkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-200"}`}
                    >
                      <option value="week">Minggu Ini</option>
                      <option value="month">Bulan Ini</option>
                      <option value="year">Tahun Ini</option>
                    </select>
                    <button
                      onClick={fetchAnalyticsData}
                      disabled={analyticsLoading}
                      className="px-4 py-2 bg-blue-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-800 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {analyticsLoading ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                      ) : (
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      )}
                      Refresh
                    </button>
                    <button
                      onClick={handleResetAnalytics}
                      className="px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-red-700 transition-all flex items-center gap-2"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Reset Data
                    </button>
                  </div>
                </div>

                {analyticsLoading ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-900" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div
                        className={`rounded-2xl p-6 text-center shadow-sm ${darkMode ? "bg-slate-800" : "bg-white"} border ${darkMode ? "border-slate-700" : "border-slate-100"}`}
                      >
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                          Total Pengunjung (Unique)
                        </p>
                        <p className="text-3xl font-black text-blue-900 mt-2">
                          {analyticsData.totalUniqueVisitors.toLocaleString()}
                        </p>
                        <p className="text-[8px] text-slate-400 mt-1">
                          {analyticsData.totalPageViews.toLocaleString()} page
                          views
                        </p>
                      </div>
                      <div
                        className={`rounded-2xl p-6 text-center shadow-sm ${darkMode ? "bg-slate-800" : "bg-white"} border ${darkMode ? "border-slate-700" : "border-slate-100"}`}
                      >
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                          Total Pembeli (Unique)
                        </p>
                        <p className="text-3xl font-black text-green-600 mt-2">
                          {analyticsData.totalBuyers.toLocaleString()}
                        </p>
                        <p className="text-[8px] text-slate-400 mt-1">
                          Dari tabel projects
                        </p>
                      </div>
                      <div
                        className={`rounded-2xl p-6 text-center shadow-sm ${darkMode ? "bg-slate-800" : "bg-white"} border ${darkMode ? "border-slate-700" : "border-slate-100"}`}
                      >
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                          Hari Ini (Pengunjung)
                        </p>
                        <p className="text-3xl font-black text-blue-900 mt-2">
                          {analyticsData.todayUniqueVisitors}
                        </p>
                        <p className="text-[8px] text-slate-400 mt-1">
                          {analyticsData.todayVisitors} page views
                        </p>
                      </div>
                      <div
                        className={`rounded-2xl p-6 text-center shadow-sm ${darkMode ? "bg-slate-800" : "bg-white"} border ${darkMode ? "border-slate-700" : "border-slate-100"}`}
                      >
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                          Hari Ini (Pembeli)
                        </p>
                        <p className="text-3xl font-black text-green-600 mt-2">
                          {analyticsData.todayBuyers}
                        </p>
                        <p className="text-[8px] text-slate-400 mt-1">
                          Order masuk hari ini
                        </p>
                      </div>
                    </div>

                    <div
                      className={`rounded-2xl p-6 shadow-sm border ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
                    >
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                        Grafik Pengunjung vs Pembeli (7 Hari Terakhir)
                      </p>
                      <div className="h-80">
                        <CombinedChart />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div
                        className={`rounded-2xl p-6 shadow-sm border ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
                      >
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                          Perangkat Pengunjung
                        </p>
                        <div className="h-56">
                          <DeviceChart />
                        </div>
                      </div>
                      <div
                        className={`rounded-2xl p-6 shadow-sm border ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
                      >
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                          Sumber Traffic
                        </p>
                        <div className="h-56">
                          <TrafficChart />
                        </div>
                      </div>
                    </div>

                    {/* DETAIL PERANGKAT (HP, Browser, OS) */}
                    <div
                      className={`rounded-2xl p-6 shadow-sm border ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
                    >
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                        📱 Detail Perangkat Pengunjung (Top 20)
                      </p>
                      {analyticsData.deviceDetails.length === 0 ? (
                        <p className="text-center text-slate-400 text-sm py-8">
                          Belum ada data perangkat
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-[11px]">
                            <thead
                              className={
                                darkMode ? "bg-slate-700" : "bg-slate-50"
                              }
                            >
                              <tr>
                                <th className="text-left p-3 font-black">
                                  Perangkat
                                </th>
                                <th className="text-left p-3 font-black">
                                  Model
                                </th>
                                <th className="text-left p-3 font-black">
                                  Browser
                                </th>
                                <th className="text-left p-3 font-black">OS</th>
                                <th className="text-right p-3 font-black">
                                  Pengunjung
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {analyticsData.deviceDetails.map(
                                (device, idx) => (
                                  <tr
                                    key={idx}
                                    className="hover:bg-slate-50/50 transition-all"
                                  >
                                    <td className="p-3 font-medium">
                                      {device.brand}
                                    </td>
                                    <td className="p-3 text-slate-500">
                                      {device.model}
                                    </td>
                                    <td className="p-3">
                                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-[9px] font-black">
                                        {device.browser}
                                      </span>
                                    </td>
                                    <td className="p-3 text-slate-500">
                                      {device.os} {device.osVersion}
                                    </td>
                                    <td className="p-3 text-right font-black text-blue-900">
                                      {device.count}
                                    </td>
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    <div
                      className={`rounded-2xl p-6 shadow-sm border ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
                    >
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                        Halaman Populer
                      </p>
                      {analyticsData.topPages.length === 0 ? (
                        <p className="text-center text-slate-400 text-sm py-8">
                          Belum ada data halaman
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {analyticsData.topPages.map((page, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center"
                            >
                              <span className="text-[11px] font-mono text-slate-600">
                                {page.page === "/" ? "Home" : page.page}
                              </span>
                              <div className="flex items-center gap-3">
                                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-900 rounded-full"
                                    style={{
                                      width: `${(page.views / analyticsData.topPages[0].views) * 100}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-[10px] font-black text-blue-900 w-16 text-right">
                                  {page.views} views
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ===================== TAB 6: BACKUP ===================== */}
            {activeTab === "backup" && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div className="bg-blue-900 px-6 py-4 rounded-2xl shadow-lg">
                    <h2 className="text-blue-50 font-black text-sm uppercase tracking-widest">
                      DATABASE BACKUP
                    </h2>
                    <p className="text-blue-100 text-[8px] font-bold uppercase tracking-wider mt-1">
                      Backup & Restore Data
                    </p>
                  </div>
                </div>

                <div
                  className={`rounded-2xl p-8 shadow-sm border ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
                >
                  <h3 className="font-black text-lg uppercase tracking-tighter mb-6">
                    Manual Backup
                  </h3>
                  <div className="flex flex-wrap gap-6 items-center">
                    <button
                      onClick={handleBackup}
                      disabled={backupLoading}
                      className="px-8 py-4 bg-green-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-wider hover:bg-green-700 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                    >
                      {backupLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                      )}
                      Backup Sekarang
                    </button>
                    <p className="text-[10px] text-slate-400 italic">
                      Klik tombol untuk mendownload file backup (JSON) dari
                      semua data (Portfolio, Projects, Testimonials)
                    </p>
                  </div>
                </div>

                <div
                  className={`rounded-2xl p-8 shadow-sm border ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
                >
                  <h3 className="font-black text-lg uppercase tracking-tighter mb-6">
                    Restore Data
                  </h3>
                  <div className="flex flex-wrap gap-6 items-center">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".json"
                        onChange={(e) => setRestoreFile(e.target.files[0])}
                        className="hidden"
                      />
                      <div className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-slate-200 transition-all cursor-pointer flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                          />
                        </svg>
                        Pilih File Backup
                      </div>
                    </label>
                    {restoreFile && (
                      <span className="text-[10px] text-green-600 font-medium">
                        File: {restoreFile.name}
                      </span>
                    )}
                    <button
                      onClick={handleRestore}
                      disabled={!restoreFile || backupLoading}
                      className="px-8 py-3 bg-red-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-wider hover:bg-red-700 transition-all shadow-md disabled:opacity-50"
                    >
                      Restore Data
                    </button>
                    <p className="text-[10px] text-red-400 italic">
                      ⚠️ Peringatan: Restore akan menimpa data yang ada!
                    </p>
                  </div>
                </div>

                <div
                  className={`rounded-2xl p-6 shadow-sm border ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
                >
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                    Riwayat Backup
                  </p>
                  {backupHistory.length === 0 ? (
                    <p className="text-center text-slate-400 text-sm py-8">
                      Belum ada riwayat backup
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {backupHistory.map((backup) => (
                        <div
                          key={backup.id}
                          className="flex justify-between items-center p-3 bg-slate-50 rounded-xl"
                        >
                          <div>
                            <p className="text-[11px] font-bold text-slate-700">
                              {backup.filename}
                            </p>
                            <p className="text-[9px] text-slate-400">
                              {new Date(backup.date).toLocaleString("id-ID")}
                            </p>
                          </div>
                          <span className="text-[9px] text-slate-500">
                            {Math.round(backup.size / 1024)} KB
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 7: MENUNGGU KONFIRMASI */}
            {activeTab === "waiting" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="bg-yellow-600 px-6 py-4 rounded-2xl shadow-lg">
                    <h2 className="text-white font-black text-sm uppercase tracking-widest">
                      ⏳ Menunggu Konfirmasi Pembayaran
                    </h2>
                    <p className="text-yellow-100 text-[8px] font-bold uppercase tracking-wider mt-1">
                      Customer sudah upload bukti, menunggu verifikasi admin
                    </p>
                  </div>
                  <button
                    onClick={fetchWaitingPayments}
                    disabled={waitingLoading}
                    className="px-4 py-2 bg-blue-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-800 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {waitingLoading ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                    ) : (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    )}
                    Refresh
                  </button>
                </div>

                {waitingLoading ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-900" />
                  </div>
                ) : waitingPayments.length === 0 ? (
                  <div
                    className={`text-center py-20 rounded-[3rem] border ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
                  >
                    <div className="text-5xl mb-4">✅</div>
                    <p
                      className={`text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                    >
                      Tidak ada pembayaran yang menunggu konfirmasi
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {waitingPayments.map((proj) => (
                      <div
                        key={proj.id}
                        className={`p-6 rounded-[2rem] border shadow-sm ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
                      >
                        <div className="flex flex-wrap justify-between items-start gap-4">
                          <div>
                            <h3
                              className={`font-black text-lg uppercase tracking-tighter ${darkMode ? "text-white" : "text-slate-900"}`}
                            >
                              {proj.client_name}
                            </h3>
                            <p className="text-blue-600 font-bold text-[10px] uppercase tracking-widest">
                              {proj.project_title} • {proj.website_category}
                            </p>
                            <div className="flex flex-wrap gap-3 mt-2">
                              <span className="text-[10px] font-black text-slate-600 flex items-center gap-1.5">
                                📱 {proj.no_hp || "-"}
                              </span>
                              <span className="text-[10px] font-black text-blue-900 flex items-center gap-1.5">
                                💰 Rp {Number(proj.price || 0).toLocaleString()}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                                🕐{" "}
                                {new Date(proj.created_at).toLocaleString(
                                  "id-ID",
                                  { dateStyle: "medium", timeStyle: "short" },
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() =>
                                confirmPayment(proj.id, proj.payments?.[0]?.id)
                              }
                              className="px-6 py-2 bg-green-600 text-white rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-green-700 transition-all"
                            >
                              ✓ Konfirmasi
                            </button>
                            <button
                              onClick={() => {
                                if (proj.payments?.[0]?.payment_proof_url) {
                                  window.open(
                                    proj.payments[0].payment_proof_url,
                                    "_blank",
                                  );
                                }
                              }}
                              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-slate-200 transition-all"
                            >
                              📷 Lihat Bukti
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* MODAL ALERT & CONFIRM */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setModal({ ...modal, isOpen: false })}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl border border-slate-100"
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                {modal.title}
              </h3>
            </div>
            <p className="text-slate-600 text-center text-sm leading-relaxed">
              {modal.message}
            </p>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setModal({ ...modal, isOpen: false })}
                className="flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-wider border-2 border-slate-200 text-slate-500 hover:bg-slate-100 transition-all"
              >
                {modal.type === "alert" ? "Tutup" : "Batal"}
              </button>
              {modal.type === "confirm" && (
                <button
                  onClick={modal.onConfirm}
                  className="flex-1 py-4 bg-red-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-wider hover:bg-red-800 transition-all"
                >
                  Ya, Lanjutkan
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL ACCEPT */}
      {acceptModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() =>
              setAcceptModal({
                isOpen: false,
                project: null,
                estimateDays: "",
                assignedTo: "",
              })
            }
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl border border-slate-100"
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                Accept Project
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                {acceptModal.project?.project_title}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-2">
                  Estimasi Hari Pengerjaan
                </label>
                <input
                  type="number"
                  min="1"
                  value={acceptModal.estimateDays}
                  onChange={(e) =>
                    setAcceptModal({
                      ...acceptModal,
                      estimateDays: e.target.value,
                    })
                  }
                  placeholder="Contoh: 7"
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-900 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-2">
                  Assign ke Developer / PIC
                </label>
                <input
                  type="text"
                  value={acceptModal.assignedTo}
                  onChange={(e) =>
                    setAcceptModal({
                      ...acceptModal,
                      assignedTo: e.target.value,
                    })
                  }
                  placeholder="Nama Developer"
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-900 outline-none transition"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() =>
                  setAcceptModal({
                    isOpen: false,
                    project: null,
                    estimateDays: "",
                    assignedTo: "",
                  })
                }
                className="flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-wider border-2 border-slate-200 text-slate-500 hover:bg-slate-100 transition-all"
              >
                Batal
              </button>
              <button
                onClick={submitAccept}
                className="flex-1 py-4 bg-blue-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-wider hover:bg-green-700 transition-all"
              >
                Accept ke Development
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
