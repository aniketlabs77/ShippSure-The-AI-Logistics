package com.aniket.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.aniket.service.AiService;

@Controller
public class AILogisticsController {

	@Autowired
	private AiService aiService;

	@GetMapping("/")
	public String home() {
		return "index";
	}

	@GetMapping("/login")
	public String login(@RequestParam(required = false) String role) {
		return "login";
	}

	@GetMapping("/register")
	public String register(@RequestParam(required = false) String role) {
		return "index";
	}

	@GetMapping("/book-shipment")
	public String bookShipment() {
		return "book-shipment";
	}

	@GetMapping("/shipments")
	public String shipments() {
		return "shipments";
	}

	@GetMapping("/shipment")
	public String shipment() {
		return "shipment";
	}

	@GetMapping("/customer-dashboard")
	public String customerDashboard() {
		return "customer-dashboard";
	}

	@GetMapping("/logout")
	public String logout() {
		return "redirect:/";
	}

	@GetMapping("/PredictVehicle")
	public String predictVehicle(@RequestParam String weight, @RequestParam String width, @RequestParam String length,
			@RequestParam String height, RedirectAttributes ra) {
		String sys_prompt = """
				Act as Logistic Vehicle Assigner.
				You will be provided with weight, height, length and
				width of the product,
				you have to suggest the vehicle type.
				Vehicle type must be strictly from the following vehicle only.
				Vehicle list: Bike, Cargo Auto, Mini Truck, Truck.
				""";
		String user_prompt = "Here is the product dimensions: Weight: " + weight + " , Width: " + width + " , Height: "
				+ height + " and length: " + length;

		String result = aiService.askAi(sys_prompt, user_prompt);
		ra.addFlashAttribute("result", result);

		return "redirect:/";
	}

}
