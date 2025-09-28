// Sample product data - would normally come from an API
export const products = [
        {
            "id": 1,
            "productName": "Nồi cơm điện thông minh",
            "description": "Nồi cơm điện thông minh với nhiều chức năng nấu, dung tích 1.8 lít, thích hợp cho gia đình 4-6 người. Công nghệ giữ nhiệt 24h, lòng nồi chống dính, dễ dàng vệ sinh.",
            "originalPrice": 1290000,
            "salePrice": 1290000,
            "quantityInStock": 500,
            "categoryId": "kitchen",
            "imageUrl": "img/noicomdien.webp"
        },
        {
            "id": 2,
            "productName": "Máy xay sinh tố đa năng",
            "description": "Máy xay sinh tố công suất 800W với 4 tốc độ xay khác nhau. Dễ dàng xay nhuyễn các loại hạt, đá, trái cây. Thiết kế hiện đại, dễ vệ sinh.",
            "originalPrice": 890000,
            "salePrice": 890000,
            "quantityInStock": 480,
            "categoryId": "kitchen",
            "imageUrl": "img/mayxay.webp"
        },
        {
            "id": 3,
            "productName": "Bộ chăn ga gối cotton",
            "description": "Bộ chăn ga gối làm từ 100% cotton, mềm mại, thoáng khí, thấm hút tốt. Phù hợp với mọi mùa trong năm, dễ dàng vệ sinh và bền màu sau nhiều lần giặt.",
            "originalPrice": 1590000,
            "salePrice": 1590000,
            "quantityInStock": 300,
            "categoryId": "bedroom",
            "imageUrl": "img/bochangagoi.webp"
        },
        {
            "id": 4,
            "productName": "Đèn ngủ cảm ứng",
            "description": "Đèn ngủ cảm ứng với 3 chế độ ánh sáng, tự động bật tắt khi chạm vào. Thiết kế nhỏ gọn, tiết kiệm điện, ánh sáng dịu nhẹ không gây chói mắt.",
            "originalPrice": 450000,
            "salePrice": 450000,
            "quantityInStock": 50,
            "categoryId": "bedroom",
            "imageUrl": "img/denngu.jpg"
        },
        {
            "id": 5,
            "productName": "Bộ dao nhà bếp cao cấp",
            "description": "Bộ dao nhà bếp 5 món làm từ thép không gỉ cao cấp, sắc bén và bền bỉ. Thiết kế công thái học, cầm nắm thoải mái, an toàn khi sử dụng.",
            "originalPrice": 1190000,
            "salePrice": 1190000,
            "quantityInStock": 50,
            "categoryId": "kitchen",
            "imageUrl": "img/bodao.webp"
        },
        {
            "id": 6,
            "productName": "Gương phòng tắm LED",
            "description": "Gương phòng tắm tích hợp đèn LED, cảm ứng chống mờ, tiết kiệm điện. Thiết kế hiện đại, sang trọng, dễ dàng lắp đặt và vệ sinh.",
            "originalPrice": 1890000,
            "salePrice": 1890000,
            "quantityInStock": 50,
            "categoryId": "bathroom",
            "imageUrl": "img/guongled.webp"
        },
        {
            "id": 7,
            "productName": "Kệ để đồ phòng tắm",
            "description": "Kệ để đồ phòng tắm bằng inox không gỉ, chịu nước tốt. Thiết kế nhiều tầng, tối ưu không gian, dễ dàng lắp đặt và vệ sinh.",
            "originalPrice": 590000,
            "salePrice": 590000,
            "quantityInStock": 50,
            "categoryId": "bathroom",
            "imageUrl": "img/kededoquanao.webp"
        },
        {
            "id": 8,
            "productName": "Sofa góc phòng khách",
            "description": "Sofa góc phòng khách bọc vải cao cấp, khung gỗ tự nhiên, đệm mút D40 êm ái. Thiết kế hiện đại, sang trọng, dễ dàng kết hợp với nhiều phong cách nội thất.",
            "originalPrice": 15900000,
            "salePrice": 15900000,
            "quantityInStock": 50,
            "categoryId": "livingroom",
            "imageUrl": "img/sofagocphongkhach.webp"
        },
        {
            "id": 9,
            "productName": "Bàn trà hiện đại",
            "description": "Bàn trà thiết kế hiện đại, mặt kính cường lực, chân gỗ tự nhiên. Kết hợp hoàn hảo với sofa phòng khách, tạo không gian tiếp khách sang trọng.",
            "originalPrice": 2990000,
            "salePrice": 2990000,
            "quantityInStock": 50,
            "categoryId": "livingroom",
            "imageUrl": "img/bantrahiendai.webp"
        },
        {
            "id": 10,
            "productName": "Bộ hộp đựng gia vị",
            "description": "Bộ 6 hộp đựng gia vị bằng thủy tinh, nắp gỗ kín hơi. Thiết kế nhỏ gọn, sang trọng, giữ gia vị luôn khô ráo và thơm ngon.",
            "originalPrice": 390000,
            "salePrice": 390000,
            "quantityInStock": 50,
            "categoryId": "kitchen",
            "imageUrl": "img/bohopdunggiavi.jpg"
        },
        {
            "id": 11,
            "productName": "Thảm trải sàn phòng khách",
            "description": "Thảm trải sàn phòng khách size 160x230cm, chất liệu lông ngắn cao cấp, mềm mại, không xù lông. Thiết kế hiện đại, nhiều màu sắc lựa chọn.",
            "originalPrice": 1690000,
            "salePrice": 1690000,
            "quantityInStock": 50,
            "categoryId": "livingroom",
            "imageUrl": "img/thamtrai.jpg"
        },
        {
            "id": 12,
            "productName": "Màn cửa chống nắng",
            "description": "Màn cửa chống nắng 2 lớp, chất liệu polyester cao cấp, cản 90% tia UV. Thiết kế hiện đại, dễ dàng lắp đặt và vệ sinh.",
            "originalPrice": 890000,
            "salePrice": 890000,
            "quantityInStock": 50,
            "categoryId": "livingroom",
            "imageUrl": "img/mancua.jpg"
        },
        {
            "id": 13,
            "productName": "Tủ lạnh",
            "description": "Tủ lạnh 2 cửa đa năng, chất liệu polyester cao cấp, giữ lạnh hiệu quả. Thiết kế hiện đại, dễ dàng lắp đặt và vệ sinh.",
            "originalPrice": 8900000,
            "salePrice": 8900000,
            "quantityInStock": 270,
            "categoryId": "kitchen",
            "imageUrl": "img/tulanh1.jpg"
        },
        {
            "id": 14,
            "productName": "Bộ nồi inox",
            "description": "Bộ nồi inox đa năng, siêu bền, chịu nhiệt tốt, sang trọng, chất liệu polyester cao cấp. Thiết kế hiện đại, dễ vệ sinh.",
            "originalPrice": 200000,
            "salePrice": 200000,
            "quantityInStock": 90,
            "categoryId": "kitchen",
            "imageUrl": "img/bonoinox.webp"
        },
        {
            "id": 15,
            "productName": "Đèn trần phòng khách",
            "description": "Đen trần hiện đại, họa tiết sang trọng, phù hợp với các gian phòng sang trọng, chất liệu polyester cao cấp. Thiết kế hiện đại, dễ dàng lắp đặt và vệ sinh.",
            "originalPrice": 3999999,
            "salePrice": 3999999,
            "quantityInStock": 100,
            "categoryId": "livingroom",
            "imageUrl": "img/dentrangtri.jpg"
        }

];