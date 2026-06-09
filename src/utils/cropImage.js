export const cropImageToSquare = async (file) => {
  const imageUrl = URL.createObjectURL(file)
  const image = new Image()
  image.src = imageUrl
  await new Promise((resolve, reject) => {
    image.onload = resolve
    image.onerror = reject
  })

  const size = Math.min(image.width, image.height)
  const sourceX = (image.width - size) / 2
  const sourceY = (image.height - size) / 2
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const context = canvas.getContext('2d')
  context.drawImage(image, sourceX, sourceY, size, size, 0, 0, 1024, 1024)
  URL.revokeObjectURL(imageUrl)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], file.name.replace(/\.[^.]+$/, '') + '-crop.jpg', { type: 'image/jpeg' }))
    }, 'image/jpeg', 0.9)
  })
}
