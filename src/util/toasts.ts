import {toastController} from "@ionic/vue";

/*
    Utilities, welche Wrapper-Methoden um Ionic's ToastController bereitstellen.
    Ermöglicht dadurch schlankere Aufrufe und einheitliche Standardwerte.
 */

export const actionToast = async (onAction: () => void, actionLabel: string, header: string,
                                  message: string, color = "primary") => {
    const toast = await toastController.create({
        header: header, message: message, color: color,
        buttons: [{
            side: "end", text: actionLabel,
            handler: async () => {
                await toast.dismiss();
                onAction();
            }
        }],
        cssClass: 'toast-elevated'
    });
    await toast.present();
}

export const retryToast = async (onRetry: () => void, message: string, header = "Fehler",
                                 actionLabel = "Erneut versuchen") => {
    await actionToast(onRetry, actionLabel, header, message);
}

export const infoToast = async (header: string, message: string, color = "warning",
                                duration = 3000) => {
    await (await toastController.create({
        header: header,
        message: message,
        duration: duration,
        color: color,
        cssClass: 'toast-elevated'
    })).present();
}
