import React from "react";

export default function Footer(){
	return(
		<footer className="bg-primary text-primary-foreground/80 py-6">
			<div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
				<span className="text-sm">&copy; {new Date().getFullYear()} Fit Plus Ultra. Todos los derechos reservados.</span>
				<div className="flex space-x-4 mt-2 md:mt-0">
					<a href="#" className="hover:text-primary-foreground transition">Inicio</a>
				</div>
			</div>
		</footer>
	);
}
