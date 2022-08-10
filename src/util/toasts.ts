import {toastController} from "@ionic/vue";

/*
    Utilities, welche Wrapper-Methoden um Ionic's ToastController bereitstellen.
    Ermöglicht dadurch schlankere Aufrufe und einheitliche Standardwerte.
 */

export const retryToast = async (onRetry: () => void, message: string, header = "Fehler",
                                 actionLabel = "Erneut versuchen") => {
    const toast = await toastController.create({
        header: header,
        message: message,
        color: "warning",
        buttons: [
            {
                side: "end",
                text: actionLabel,
                handler: async () => {
                    await toast.dismiss();
                    onRetry();
                }
            }
        ]
    });
    await toast.present();
}

export const infoToast = async (header: string, message: string, color = "warning",
                                duration = 3000) => {
    await (await toastController.create({
        header: header,
        message: message,
        duration: duration,
        color: color
    })).present();
}
