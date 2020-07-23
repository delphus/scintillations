export function parseArguments(message: string): string[] {
  const regex = new RegExp('"[^"]+"|[\\S]+', "g");
  const args: string[] = [];
  message.match(regex)!.forEach((element) => {
    if (!element) return;
    return args.push(element.replace(/"/g, ""));
  });
  return args;
}
