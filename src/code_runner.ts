import $ from "jquery";
import * as monaco from "monaco-editor";

// Main CodeRunner Class Instation
export default class CodeRunner {
	private editor: any;
	private language: string;
	private default_messages: {
		[key: string]: string
	};

	constructor(container_id: string, language: string) {
		this.language = language;
		this.default_messages = {
			python: "print('Hello, World!')",
			javascript: "console.log('Hello, World!');",
			cpp: "#include <iostream>\nint main() {\n  std::cout << \"Hello, World!\" << std::endl;\n  return 0;\n}",
			java: "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello, World!\");\n  }\n}",
			cs: "static void Main(string[] args)\n{Console.WriteLine(\"Hello, World!\");\n}",
			golang: "func main() {\n fmt.Println(\"hello world\")\n}"
		};
		this.initEditor(container_id);
		this.setupTabSwitch();
	}

	// Function to create the editor
	private initEditor(container_id: string): void {
		this.editor = monaco.editor.create(document.getElementById(container_id) as HTMLElement, {
			value: this.default_messages[this.language],
			language: this.language,
			theme: "vs-dark",
			automaticLayout: true,
			readOnly: false
		});
	}

	// Function to setup tab switching event
	private setupTabSwitch(): void {
		$(".tab").on("click", (event) => {
			$(".tab").removeClass("active-tab");
			$(event.target).addClass("active-tab");
			this.language = $(event.target).data("lang");

			// Ensure Monaco updates the language properly
			if (this.editor) {
				this.editor.setValue(this.default_messages[this.language]);
				monaco.editor.setModelLanguage(this.editor.getModel()!, this.language);
			}
		});
	}

	// Fucntion for when the user runs the code
	public async runCode(output_id: string): Promise<void> {
		if (!this.editor) return;
		const code: string = this.editor.getValue();
		$(`#${output_id}`).text("Running...");

		try {
			const response = await fetch("https://emkc.org/api/v2/piston/execute", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ language: this.language, version: "latest", files: [{ content: code }] })
			});

			const result = await response.json();
			$(`#${output_id}`).text(result.run.output || result.run.stderr);
		} catch (error) {
			$(`#${output_id}`).text(`Error: ${error}`);
		}
	}
}
