### TODO

- **Priority**:

  - DONE: Make footer
  - DONE: Make product list in the home page
  - TODO: Responsive website
  - DONE: Make calculator size for user base on **height** and **weight**
  - DONE: Make modal list product into order by id

- **The future**:

  - DONE: Recommender product list by product id
  - TODO: Search product by image


### Semantic HTML

> [https://web.dev/learn/html/semantic-html/](https://web.dev/learn/html/semantic-html/)
> [https://web.dev/learn/html/semantic-html/](https://web.dev/learn/html/semantic-html/)

---

### Server actions

1. **Benefits of Server Actions**

- Allow Server Side Mutations without unnecessary API endpoints (`Cho phép các đột biến phía máy chủ mà không có điểm cuối API không cần thiết`)
  
- Reduces the amount of Client Side JS (`Giảm số lượng Client Side JS`)

- Supports Progressively Enhanced Forms (`Hỗ trợ các hình thức nâng cao dần dần`)

2. **How to implements it**

---

### URL Search params when filter (DON'T NEED TO USE USESTATE AND USEFFECT)

> [https://nextjs.org/docs/app/api-reference/functions/use-search-params#updating-searchparams](https://nextjs.org/docs/app/api-reference/functions/use-search-params#updating-searchparams)

1. **Set up**

---

### Recommender Products

---

### Search product by image


---

### Mistake in TailwindCSS

1. **Dynamic Class**

```tsx
const blue = 'blue'
<div className={`bg-${blue}-500`}>Text blue</div> // ❌❌ It's not working
```

> **Because** [https://tailwindcss.com/docs/content-configuration#class-detection-in-depth](https://tailwindcss.com/docs/content-configuration#class-detection-in-depth)

- How to resolver it ❓❓. You can code like this

```tsx
const [color, setColor] = useState<string>('green')

const text = 'bg-green-500'

return (
  <button className={`bg-${color}-500`}>Submit</button> // ✅✅ It's working
)
// because it have var text = 'bg-green-500'
```

---

### Apply SWR to fetch api and use router.query (ProductList)

Process:
  1. Create hook fetch api by SWR
  2. Re-setup query about `categories`, `sizes`, `colors`, `subCategories`,... by `router.query`
     1. Use `router` from `next/router` combine with `shallow`
     2. Push and update query params
