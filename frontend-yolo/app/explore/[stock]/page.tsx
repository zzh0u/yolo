export default function StockPage({ params }: { params: { stock: string } }) {
  return <div>StockPage {params.stock}</div>;
}