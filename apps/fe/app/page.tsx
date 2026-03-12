import Container from "@/components/Container";
import CTA from "@/components/CTA";
import HowItWorks from "@/components/HowItWorks";
import Navbar from "@/components/Navbar";
import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-primary">
      <Container className="bg-primary h-screen">
        <Navbar/>
        <CTA/> 
      </Container>
      <HowItWorks/>
    </div>
  );
}
