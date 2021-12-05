import { TranslateModule } from '@ngx-translate/core'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ColorPickerModule } from 'ngx-color-picker'
import { RouterModule } from '@angular/router'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { MatSliderModule } from '@angular/material/slider'
import { MatIconModule } from '@angular/material/icon'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatListModule } from '@angular/material/list'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatSelectModule } from '@angular/material/select'
import { StripTags } from './pipes/striptags.pipe'
import { ConnectionInfoDialogComponent } from './components/connection-info/connection-info-dialog.component'
import { MatDialogModule } from '@angular/material/dialog'
import { DialogService } from './services/dialog/dialog.service'
import { ShareFallbackComponent } from './components/share-fallback/share-fallback.component'

const PIPES = [
    StripTags
]

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        FontAwesomeModule,
        MatSliderModule,
        RouterModule,
        TranslateModule,
        MatIconModule,
        MatSnackBarModule,
        ColorPickerModule,
        MatButtonModule,
        MatCardModule,
        MatListModule,
        MatToolbarModule,
        MatDialogModule,
    ],
    declarations: [...PIPES, ConnectionInfoDialogComponent, ShareFallbackComponent],
    exports: [
        CommonModule,
        FormsModule,
        FontAwesomeModule,
        MatSliderModule,
        TranslateModule,
        MatIconModule,
        MatSelectModule,
        MatSnackBarModule,
        ColorPickerModule,
        MatButtonModule,
        MatCardModule,
        MatListModule,
        MatToolbarModule,
        ...PIPES
    ],
    entryComponents:[ConnectionInfoDialogComponent],
    providers: [DialogService]
})
export class SharedModule {
}
