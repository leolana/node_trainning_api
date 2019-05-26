export interface Mailer {
  emailTemplates;
  enviar(mailOptions): Promise<any | void>;
}

export function validateEmailSubject(subject: string) {
  const subjectPattern = /r?(\n|\\n)/g;
  const removeMultiSpaces = / \s*/g;

  return (subject || '')
    .replace(subjectPattern, '')
    .replace(removeMultiSpaces, ' ')
    .trim();
}

export default Mailer;
