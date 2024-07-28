import Image from "next/image";
import NewestProducts from "./components/NewestProducts";
import { ProductRow } from "./components/ProductRow";

export default function Home() {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 mb-24">
      <div className="max-w-3xl mx-auto text-2xl sm:text-5xl lg:text-6xl font-semibold text-center">
        <h1>Find the best Tailwind</h1>
        <h1 className="text-primary">Templates & Icons</h1>
        <p className="lg:text-lg text-muted-foreground mx-auto mt-5 w-[90%] text-base font-normal">
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quod
          molestias quos porro quibusdam incidunt similique ea cumque eos
          possimus dolorem, consequuntur distinctio ullam natus id odit aliquam
          iusto expedita modi.
        </p>
      </div>
      <ProductRow category="newest" />
      <ProductRow category="templates" />
      <ProductRow category="icons" />
      <ProductRow category="uikits" />
    </section>
  );
}
