import { Capacitor } from '@capacitor/core'
import { toast } from 'sonner'

export async function scheduleDailyReminder(enabled: boolean, timeStr: string) {
  if (!enabled) {
    if (Capacitor.isNativePlatform()) {
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications')
        await LocalNotifications.cancel({ notifications: [{ id: 101 }] })
      } catch (e) {
        console.error(e)
      }
    }
    return
  }

  const [hours, minutes] = timeStr.split(':').map(Number)

  if (Capacitor.isNativePlatform()) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      const perm = await LocalNotifications.requestPermissions()
      if (perm.display !== 'granted') {
        toast.error('Chưa được cấp quyền gửi thông báo trên điện thoại')
        return
      }

      await LocalNotifications.cancel({ notifications: [{ id: 101 }] })
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 101,
            title: 'Ví Tháng 📝',
            body: 'Đã đến giờ ghi chép chi tiêu hôm nay rồi bạn ơi!',
            schedule: {
              on: {
                hour: hours,
                minute: minutes,
              },
              allowWhileIdle: true,
            },
          },
        ],
      })
      toast.success(`Đã đặt nhắc nhở hàng ngày lúc ${timeStr}`)
    } catch (e) {
      console.error(e)
      toast.error('Lỗi khi cài đặt thông báo')
    }
  } else if ('Notification' in window) {
    // Web / Electron notifications
    if (Notification.permission !== 'granted') {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') {
        toast.warning('Vui lòng cho phép thông báo trên trình duyệt / ứng dụng')
        return
      }
    }
    toast.success(`Đã kích hoạt nhắc nhở chi tiêu lúc ${timeStr}`)
  } else {
    toast.info(`Đã lưu thời gian nhắc nhở: ${timeStr}`)
  }
}
