"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import api from "@/services/api.js";
import ProductCarouselSection from "@/components/ProductCarouselSection";
import CategoryMenuGrid from "@/components/CategoryMenuGrid";
import HeroSection from "@/components/HeroSection";
import SidebarMenu from "@/components/SidebarMenu"; // Sidebar component

const pickArray = (data) => data?.content || data || [];

const slugify = (s = "") =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  

function HomePage() {
  const productSections = useRef([]);

  // Hàm cuộn đến phần mục sản phẩm
  const scrollToCategory = (index) => {
    if (productSections.current[index]) {
      window.scrollTo({
        top: productSections.current[index].offsetTop, // Cuộn đến vị trí của phần sản phẩm
        behavior: 'smooth',
      });
    }
  };

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const category = [
    {
      title: "Khuyến mãi",
      subCategories: [{ title: "Khuyến mãi tháng này", link: "/khuyenmai" }],
      link: "/khuyenmai",
    },
    {
      title: "Thịt, Cá, Trứng, Hải Sản",
      subCategories: [
        { title: "Thịt heo", link: "/thitheo" },
        { title: "Thịt bò", link: "/thitbo" },
        { title: "Thịt gà", link: "/thitga" },
      ],
      link: "/thitca",
    },
    {
      title: "Rau, Củ, Nấm, Trái Cây",
      subCategories: [
        { title: "Rau muống", link: "/raumuong" },
        { title: "Cải ngọt", link: "/caingot" },
      ],
      link: "/rau",
    },
    {
      title: "Dầu Ăn, Nước Chấm, Gia Vị",
      subCategories: [{ title: "Dầu ăn", link: "/dauan" }],
      link: "/dauan",
    },
    // Thêm các danh mục khác
  ];

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const prodRes = await api.get("/products", { params: { page: 0, size: 200 } });
        const prodList = pickArray(prodRes.data);

        let catRes;
        try {
          catRes = await api.get("/categories", { params: { page: 0, size: 1000 } });
        } catch {
          catRes = await api.get("/categories");
        }
        const catList = pickArray(catRes.data);

        if (!ignore) {
          setProducts(Array.isArray(prodList) ? prodList : []);
          setCategories(Array.isArray(catList) ? catList : []);
        }
      } catch (e) {
        if (!ignore) setError(e?.response?.data?.message || "Không thể tải dữ liệu trang chủ");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach((c) => {
      const id = c._id || c.id || c.categoryId;
      const name = c.categoryName || c.name || c.title || "Danh mục";
      const image = c.image || c.imageUrl || c.thumbnail;
      if (id) map.set(id, { name, image });
    });
    return map;
  }, [categories]);

  const sections = useMemo(() => {
    const grouped = new Map();
    // chuẩn hoá field để dùng chung
    const normalize = (p) => ({
      _id: p._id,
      productName: p.productName || p.name || "",
      imageUrl: p.imageUrl || p.thumbnail || "",
      unitPrice: Number(p.unitPrice ?? p.price ?? 0),
      listPrice:
        p.listPrice != null
          ? Number(p.listPrice)
          : p.compareAt != null
          ? Number(p.compareAt)
          : null,
    });


    (products || []).forEach((p) => {
      const catId = p.categoryId || p.category?._id;
      if (!catId) return;
      if (!grouped.has(catId)) grouped.set(catId, []);
      grouped.get(catId).push(normalize(p));
    });

    const promoProducts = (products || [])
      .map(normalize)
      .filter((x) => x.listPrice != null && x.unitPrice < x.listPrice)
      .sort((a, b) => {
        const da = (a.listPrice - a.unitPrice) / (a.listPrice || 1);
        const db = (b.listPrice - b.unitPrice) / (b.listPrice || 1);
        return db - da;
    });

    const list = [];
    categories.forEach((c) => {
      const catId = c._id || c.id || c.categoryId;
      const items = grouped.get(catId) || [];
      if (items.length > 0) {
        const title = c.categoryName || c.name || c.title || "Danh mục";
        list.push({ id: slugify(title), title, items, catId });
      }
    });

    if (promoProducts.length) {
      list.unshift({
        id: "promo",
        htmlId:"section-promo",
        title: "Đang khuyến mãi",
        items: promoProducts,
      });
}
return list;
  }, [products, categories, categoryMap]);

  const menuItems = useMemo(() => {
    return sections.map((sec) => {
      const fromMap = categoryMap.get(sec.catId);
      const imageFromCategory = fromMap?.image;
      const imageFromProduct = sec.items?.[0]?.imageUrl;
      return {
        id: sec.id,
        title: sec.title,
        image: imageFromCategory || imageFromProduct || "/img/category-placeholder.png",
      };
    });
  }, [sections, categoryMap]);

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="animate-pulse text-gray-500">Đang tải trang chủ…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="relative section !my-4">
        <HeroSection />
      </div>

      {/* SidebarMenu and CategoryMenuGrid are aligned */}
      <div className="flex flex-row bg-emerald-50/50 shadow-md">
        {/* SidebarMenu */}
        <div className="card p-4 ml-60">
          <SidebarMenu categories={category} />
        </div>

        {/* Category Menu Grid and Products - both will have equal height */}
        <div className="homepage-container section !my-6">
          <CategoryMenuGrid items={menuItems} scrollToCategory={scrollToCategory} />

          {/* Các Mục Sản Phẩm */}
          <div className="mx-auto mt-6" id="products">
            {sections.map((sec, index) => (
          <div
            id={sec.htmlId || `section-${sec.id}`}
            ref={(el) => (productSections.current[index] = el)}
            key={sec.id}
            className="product-section my-6"
          >
            <ProductCarouselSection
              id={sec.id}
              title={sec.title}
              products={sec.items}
            />
          </div>
        ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
