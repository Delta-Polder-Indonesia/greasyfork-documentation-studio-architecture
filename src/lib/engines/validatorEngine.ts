import { sanitizeGreasyforkHtml } from "@/validators/greasyforkValidator";

export const validatorEngine = {
  sanitize(input: string) {
    try {
      return sanitizeGreasyforkHtml(input);
    } catch {
      return {
        sanitizedHtml: "",
        warnings: [{ message: "Validator fallback aktif karena sanitize error." }],
      };
    }
  },
};
