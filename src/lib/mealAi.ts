export interface MealItem {
  name: string
  price: number
  desc: string
  tag: string
}

export interface MealPlan {
  breakfast?: MealItem
  lunch: MealItem
  dinner?: MealItem
  totalCost: number
}

// Cập nhật giá cả thực tế tại Việt Nam:
// - Cơm bình dân: 30k - 40k
// - Bún, phở, hủ tiếu: 35k - 45k
// - Bữa sáng: 20k - 30k (bánh mì, xôi, bánh cuốn)
// - Cơm tự nấu: 20k - 30k
export const MEAL_DATABASE = {
  breakfast: [
    { name: 'Bánh mì thịt chả / pate ốp la', price: 20000, desc: 'Bánh mì giòn kẹp chả lụa pate dưa leo rau thơm', tag: 'Nhanh gọn' },
    { name: 'Xôi mặn chả lụa thịt kho ruốc', price: 20000, desc: 'Xôi dẻo thơm, thêm hành phi ruốc thịt', tag: 'Chắc bụng' },
    { name: 'Bánh cuốn chả quế nóng hổi', price: 25000, desc: 'Bánh cuốn nóng rắc hành phi kèm chả lụa/chả quế', tag: 'Truyền thống' },
    { name: 'Bánh mì xíu mại / bò kho', price: 25000, desc: 'Bánh mì chấm nước sốt xíu mại đậm đà', tag: 'Đậm vị' },
    { name: 'Bánh bao 2 trứng cút xá xíu', price: 20000, desc: 'Bánh bao nóng hổi, nhân thịt đầy đặn', tag: 'Tiện lợi' },
    { name: 'Bún xào thịt băm / Hủ tiếu xào', price: 25000, desc: 'Bún xào rau cải, giá đỗ thịt heo thơm', tag: 'Nhẹ nhàng' },
    { name: 'Hủ tiếu gõ thịt nạc bò viên', price: 30000, desc: 'Tô hủ tiếu nước lèo hầm xương ấm bụng', tag: 'Quen thuộc' },
    { name: 'Phở bò tái nạm / gà ta bình dân', price: 35000, desc: 'Tô phở nóng nạp năng lượng trọn vẹn buổi sáng', tag: 'Chất lượng' },
    { name: 'Bún bò Huế / Bún riêu cua giò', price: 35000, desc: 'Nước dùng đậm đà, chả cua mọc giò heo', tag: 'Hấp dẫn' },
  ],
  lunch: [
    { name: 'Cơm bình dân (1 mặn + rau canh)', price: 30000, desc: 'Thịt kho tàu hoặc sườn xào chua ngọt, canh rau', tag: 'Phổ biến' },
    { name: 'Cơm bình dân (2 mặn + canh)', price: 35000, desc: 'Cá kho tộ + đậu hũ nhồi thịt, canh cua đồng', tag: 'Đầy đủ' },
    { name: 'Cơm tấm sườn nướng mỡ hành', price: 35000, desc: 'Miếng sườn ướp đậm vị, mỡ hành tóp mỡ dưa chua', tag: 'Đặc sản' },
    { name: 'Cơm tấm sườn bì chả ốp la', price: 40000, desc: 'Dĩa cơm tấm đầy đủ topping no nê', tag: 'No lâu' },
    { name: 'Bún đậu mắm tôm (đầy đủ chả cốm)', price: 35000, desc: 'Đậu rán giòn, bún lá chả cốm nem rán thịt chân giò', tag: 'Ngon miệng' },
    { name: 'Bún chả Hà Nội / Bún thịt nướng', price: 35000, desc: 'Thịt nướng than hoa thơm lừng chấm nước mắm chua ngọt', tag: 'Món quen' },
    { name: 'Phở bò tái nạm / Phở gà ta', price: 40000, desc: 'Bát phở bánh mềm nước dùng trong ngọt xương', tag: 'Chất lượng' },
    { name: 'Bún bò Huế đầy đủ giò chả', price: 40000, desc: 'Bát bún sợi to, giò heo chả cua huyết thơm nồng sả ớt', tag: 'Hấp dẫn' },
    { name: 'Cơm rang dưa bò giòn rụm', price: 35000, desc: 'Cơm rang hạt tơi, dưa cải chua xào thịt bò mềm', tag: 'Chắc bụng' },
    { name: 'Cơm gà xối mỡ đùi góc tư', price: 40000, desc: 'Da gà giòn rụm, cơm chiên cà chua thơm', tag: 'Đậm đà' },
    { name: 'Cơm tự nấu: Thịt kho trứng + Canh cải', price: 25000, desc: 'Tự đi chợ mua thịt heo, trứng, rau về nấu tại nhà', tag: 'Cơm tự nấu' },
    { name: 'Cơm tự nấu: Đậu sốt cà + Canh sườn bí', price: 30000, desc: 'Tự nấu mâm cơm 2 món đầy đủ dinh dưỡng', tag: 'Cơm tự nấu' },
  ],
  dinner: [
    { name: 'Cơm bình dân tự chọn', price: 30000, desc: 'Cá kho tộ hoặc gà rang sả ớt, canh rau đay mồng tơi', tag: 'Cơm nhà' },
    { name: 'Cơm sườn nướng / Cơm gà luộc', price: 35000, desc: 'Dĩa cơm nóng hổi ấm bụng buổi tối', tag: 'Chắc bụng' },
    { name: 'Bún riêu cua ốc / Bún chả cá', price: 35000, desc: 'Nước dùng thanh ngọt cà chua giấm bỗng, ốc giòn', tag: 'Dễ tiêu' },
    { name: 'Hủ tiếu Nam Vang / Mì hoành thánh', price: 35000, desc: 'Tô hủ tiếu tôm thịt hoành thánh thơm hành hẹ', tag: 'Ấm bụng' },
    { name: 'Cháo sườn sụn quẩy giòn nóng', price: 25000, desc: 'Bát cháo mịn ngọt sườn non, thêm ruốc tiêu ớt', tag: 'Nhẹ bụng' },
    { name: 'Bánh canh cua / Bánh canh giò heo', price: 35000, desc: 'Sợi bánh canh dai mềm nước dùng sệt ngọt đậm', tag: 'Ngon miệng' },
    { name: 'Mì cay 7 cấp độ / Bún hải sản', price: 40000, desc: 'Hải sản chua cay giải tỏa căng thẳng sau ngày làm việc', tag: 'Đậm vị' },
    { name: 'Cơm tự nấu: Cá nục kho dưa + Canh rau muống', price: 25000, desc: 'Nấu tại nhà ngon sạch, tiết kiệm chi phí', tag: 'Cơm tự nấu' },
    { name: 'Cơm tự nấu: Thịt bò xào hành tây + Canh ngao', price: 35000, desc: 'Đổi gió với món xào và canh chua thanh mát', tag: 'Cơm tự nấu' },
    { name: 'Mì tôm xào bò rau cải', price: 25000, desc: 'Nhanh gọn lẹ buổi tối với 1 gói mì, 1 lạng bò và rau cải', tag: 'Nhanh gọn' },
  ],
}

export function generateMealSuggestion(budget: number, mealsCount: 1 | 2 | 3): MealPlan {
  // If 1 meal: allocate budget to 1 great meal
  if (mealsCount === 1) {
    const suitable = MEAL_DATABASE.lunch.filter((m) => m.price <= budget)
    const pick = suitable.length
      ? suitable[Math.floor(Math.random() * suitable.length)]
      : {
          name: budget >= 30000 ? 'Cơm bình dân tự chọn' : 'Bánh mì thập cẩm / Cơm tự nấu',
          price: Math.min(budget, 35000),
          desc: 'Phần ăn cân đối với ngân sách bạn chọn',
          tag: 'Vừa ví tiền',
        }
    return {
      lunch: pick,
      totalCost: pick.price,
    }
  }

  // If 2 meals: Lunch + Dinner (Trưa + Tối)
  if (mealsCount === 2) {
    // Nếu ngân sách >= 65k: mỗi bữa thoải mái ăn cơm 30-35k
    if (budget >= 65000) {
      const lunchSuitable = MEAL_DATABASE.lunch.filter((m) => m.price <= 40000)
      const lunch = lunchSuitable[Math.floor(Math.random() * lunchSuitable.length)] || MEAL_DATABASE.lunch[0]

      const remainDinner = budget - lunch.price
      const dinnerSuitable = MEAL_DATABASE.dinner.filter((m) => m.price <= remainDinner)
      const dinner = dinnerSuitable.length
        ? dinnerSuitable[Math.floor(Math.random() * dinnerSuitable.length)]
        : MEAL_DATABASE.dinner[0]

      return {
        lunch,
        dinner,
        totalCost: lunch.price + dinner.price,
      }
    }

    // Nếu ngân sách tầm 50k - 60k cho 2 bữa:
    // Cần 1 bữa ăn quán (30k - 35k) + 1 bữa tự nấu / ăn nhẹ (20k - 25k)
    const lunch = {
      name: 'Cơm bình dân / Bún thịt nướng',
      price: 30000,
      desc: '1 phần cơm trưa văn phòng đủ món mặn và canh rau',
      tag: 'Cơm trưa quán',
    }

    const dinnerRem = budget - lunch.price
    const dinner = dinnerRem >= 25000
      ? {
          name: 'Cơm tự nấu: Thịt băm + Canh rau cải',
          price: 25000,
          desc: 'Mua đồ tự nấu buổi tối vừa ấm cúng vừa chuẩn ngân sách',
          tag: 'Cơm tự nấu',
        }
      : {
          name: 'Bánh mì chả lụa / Mì tôm bò rau',
          price: Math.max(15000, dinnerRem),
          desc: 'Bữa tối nhẹ nhàng, no bụng vừa vặn túi tiền',
          tag: 'Tiết kiệm',
        }

    return {
      lunch,
      dinner,
      totalCost: lunch.price + dinner.price,
    }
  }

  // If 3 meals: Sáng + Trưa + Tối
  // Phân bổ thực tế: Sáng 20k-25k, Trưa 35k, Tối 30k-35k (Lý tưởng cần tầm 80k-90k)
  if (budget >= 80000) {
    const bfList = MEAL_DATABASE.breakfast.filter((m) => m.price <= 25000)
    const bf = bfList[Math.floor(Math.random() * bfList.length)]

    const lunchList = MEAL_DATABASE.lunch.filter((m) => m.price <= 40000)
    const lunch = lunchList[Math.floor(Math.random() * lunchList.length)]

    const rem = budget - bf.price - lunch.price
    const dinnerList = MEAL_DATABASE.dinner.filter((m) => m.price <= rem)
    const dinner = dinnerList.length
      ? dinnerList[Math.floor(Math.random() * dinnerList.length)]
      : MEAL_DATABASE.dinner[0]

    return {
      breakfast: bf,
      lunch,
      dinner,
      totalCost: bf.price + lunch.price + dinner.price,
    }
  }

  // Nếu 3 bữa với ngân sách tầm 50k - 70k:
  // Sáng nhẹ (15k-20k) + Trưa cơm quán (30k-35k) + Tối tự nấu tiết kiệm (15k-20k)
  const bf = {
    name: 'Bánh mì ốp la / Xôi thịt',
    price: 20000,
    desc: 'Bữa sáng nhanh gọn, chắc bụng',
    tag: 'Bữa sáng',
  }
  const lunch = {
    name: 'Cơm bình dân (1 mặn + canh)',
    price: 30000,
    desc: 'Cơm trưa văn phòng đủ chất',
    tag: 'Cơm quán',
  }
  const remDinner = Math.max(15000, budget - bf.price - lunch.price)
  const dinner = {
    name: remDinner >= 25000 ? 'Cơm tự nấu: Đậu sốt cà + Canh' : 'Mì tôm trứng xúc xích rau cải',
    price: remDinner,
    desc: 'Bữa tối giản dị, tiết kiệm cho ngày hôm nay',
    tag: remDinner >= 25000 ? 'Tự nấu' : 'Tiết kiệm',
  }

  return {
    breakfast: bf,
    lunch,
    dinner,
    totalCost: bf.price + lunch.price + dinner.price,
  }
}
