export default function isCVMode(): boolean {
    return !!import.meta.env.CV
}
