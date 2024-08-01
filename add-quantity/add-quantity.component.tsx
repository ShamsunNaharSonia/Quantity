import { Component, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ItemImageComponent } from "@app/modules/machine-board/item-image/item-image.component";
import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
import { MachineConfirmationType } from "@app/shared/enums/MachineConfirmationType";
import BadPartReason from "@app/shared/models/bad-part-reason.model";
import { Item } from "@app/shared/models/item.model";
import { User } from "@app/shared/models/user.model";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";

@Component({
	selector: "app-add-quantity",
	templateUrl: "./add-quantity.component.html",
	styleUrl: "./add-quantity.component.css",
})
export class AddQuantityComponent {
	goodPartAmount: number | undefined | string = "";
	badPartReasons: BadPartReason[] = [];
	scrapPartAmounts: number[] | string[] = [];
	isFormValid = false;
	errorMessage = "";
	quantityRecording: any = [];
	itemOnOrderSelect!: any[];
	orderData: any[] = [];
	deletItemId = "";
	orderPosArray: string[] = [];
	item!: Item;
	showMore = false;
	quantityRecordingData: any = [];
	OrderData: any = [];
	scrapParts: [] = [];
	isBusy = false;
	isDataChanged: boolean = false;
	multiPosPrimaryId!: number[];
	activeRoute: any;
	dialogTitle = $localize`Add Quantity`;
	isCreateDialogOpen: boolean = false;
	selectedOrder: string = "";
	isConfirmationTypeIiot: boolean = false;
	isEditQuantityRecording: boolean = false;
	isErrorDialog: boolean = false;

	toasterStatus!: string;
	errorStatus!: string;
	editedValue: any;
	editedGoodPartAmount: number | undefined | string = "";
	editedScrapPartReason!: number;
	editedScrapPartAmount: number | undefined | string = "";
	valueState: "None" | "Error" = "None";

	proposedQuantity!: number;
	editSaveButtonLabel: string = $localize`Save`;

	confirmationType!: MachineConfirmationType;
	isDeleteDialog!: boolean;
	rowDeleteId!: number;
	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;
	@ViewChild("operationDialog") itemImageComponent?: ItemImageComponent;
	button: string = $localize`Save`;

	constructor(
		private router: Router,
		private commonService: CommonService,
		private authService: AuthService
	) {}
	ngOnInit() {
		this.getData();
	}

	getItemData(id: any) {
		this.item = new Item().deserialize({ id: id });
		this.itemImageComponent?.getMedia();
	}
	showDivOne: boolean = true;
	showDivTwo: boolean = false;
	showDivThree: boolean = false;
	showSerialView() {
		this.showDivOne = true;
		this.showDivTwo = false;
		this.showDivThree = false;
	}

	showBatchView() {
		this.showDivOne = false;
		this.showDivTwo = true;
		this.showDivThree = false;
	}

	showDefaultView() {
		this.showDivOne = false;
		this.showDivTwo = false;
		this.showDivThree = true;
	}

	getData() {
		this.commonService.get("quantity/20", false).subscribe({
			next: (d: any) => {
				this.quantityRecording = d.production_order[0].records;
				this.orderData = d.production_order;

				this.badPartReasons = d.bad_part_reason;

				this.badPartReasons.forEach(v => {
					(this.scrapPartAmounts as any).push("");
				});

				this.itemOnOrderSelect = this.orderData.map((order: any) => {
					return {
						id: order.items.id,
						custom_id: order.items.custom_id,
						name: order.items.name,
					};
				});
			},
		});
	}

	checkFormValidity() {
		const goodPartsInput = (document.getElementById("goodPartsInput") as HTMLInputElement)
			.value;

		if (this.isNumericAndPositive(goodPartsInput)) {
			this.isFormValid = true;
			this.errorMessage = "";
		} else {
			this.isFormValid = false;
			this.errorMessage = "Please enter a numeric value greater than 0.";
		}
	}
	isNumericAndPositive(value: string): boolean {
		const numberValue = Number(value);
		return !isNaN(numberValue) && numberValue > 0;
	}
	checkScrapValidity() {
		const scrapPartsInput = (document.getElementById("scrapPartAmounts") as HTMLInputElement)
			.value;
		if (this.isNumericAndPositiveScrap(scrapPartsInput)) {
			this.isFormValid = true;
			this.errorMessage = "";
		} else {
			this.isFormValid = false;
			this.errorMessage = "Please enter a numeric value greater than 0.";
		}
	}

	isNumericAndPositiveScrap(value: string): boolean {
		const numberValue = Number(value);
		return !isNaN(numberValue) && numberValue > 0;
	}

	get visibleOrders() {
		return this.showMore ? this.orderData : this.orderData.slice(0, 3);
	}

	toggleView() {
		this.showMore = !this.showMore;
	}
	get remainingOrders() {
		return this.orderData.slice(3);
	}
	selectedItem: any = null;
	displayItemDetails(item: any) {
		this.selectedItem = item;
	}

	orderSelection(order_id: string, evt?: any) {
		const updateItems = () => {
			this.itemOnOrderSelect = this.orderData
				.filter((order: any) => this.orderPosArray.includes(order.order_pos))
				.map((order: any) => {
					const item = new Item().deserialize(order.items);
					return {
						id: item.id,
						custom_id: item.custom_id,
						name: item.name,
						img: item.media,
					};
				});
		};
	}

	onClick(order_id: string, evt?: any) {
		this.orderSelection(order_id, evt);
	}

	selectOrder(order: any) {
		this.selectedOrder = order;
		this.itemOnOrderSelect = order.items ? [order.items] : [];
	}
	columns: any = [
		{
			Header: $localize`Date`,
			accessor: "date_key",
			disableFilters: false,
			disableGroupBy: false,
			disableSortBy: false,
		},

		{
			Header: $localize`Shift`,
			accessor: "created_at",
			disableFilters: false,
			disableGroupBy: false,
			disableSortBy: false,
		},
		{
			Header: $localize`Good parts`,
			accessor: "good",
			disableFilters: false,
			disableGroupBy: false,
			disableSortBy: false,
		},
		{
			Header: $localize`Scrap parts`,
			accessor: "bad",
			disableFilters: false,
			disableGroupBy: false,
			disableSortBy: false,
		},
		{
			Header: $localize`Order`,
			accessor: "order",
			disableFilters: false,
			disableGroupBy: false,
			disableSortBy: false,
		},
		{
			Header: $localize`Scrap parts reason`,
			accessor: "bad_part_reason_name",
			disableFilters: false,
			disableGroupBy: false,
			disableSortBy: false,
		},

		{
			Header: $localize`Employee`,
			accessor: "user_name",
			disableFilters: false,
			disableGroupBy: false,
			disableSortBy: false,
		},
	];

	validateGoodPartAmount(): boolean {
		if (this.goodPartAmount == "") {
			return true;
		}

		const amount = Number(this.goodPartAmount);
		if (isNaN(amount) || amount < 1 || !Number.isInteger(amount)) {
			this.isDataChanged = false;
			return false;
		} else {
			if (this.goodPartAmount != "") {
				this.isDataChanged = true;
			}
			return true;
		}
	}

	validateScrapPartAmount(index: number): boolean {
		if (this.scrapPartAmounts[index] == "") {
			return true;
		}

		const amount = Number(this.scrapPartAmounts[index]);
		if (isNaN(amount) || amount < 1 || !Number.isInteger(amount)) {
			this.isDataChanged = false;
			return false;
		} else {
			if (this.scrapPartAmounts[index] != "") {
				this.isDataChanged = true;
			}
			return true;
		}
	}

	validateAllInputs(): boolean {
		this.isDataChanged = false;

		if (this.validateGoodPartAmount() == false) {
			return false;
		}

		for (let i = 0; i < this.scrapPartAmounts.length; i++) {
			if (this.validateScrapPartAmount(i) == false) {
				return false;
			}
		}

		return this.isDataChanged;
	}
	EditItems: boolean = false;
	editClick(event: any) {
		this.EditItems = true;
		this.editedValue = event;
		console.log(this.editedValue);
		this.editedGoodPartAmount = this.editedValue.good;
		this.editedScrapPartAmount = this.editedValue.bad;
		this.editedScrapPartReason = this.editedValue.bad_part_reason_id;
	}

	onSave() {
		if (this.validateAllInputs()) {
			console.log(this.editedScrapPartReason);

			const dataToSend = this.buildDataToSend();
			console.log(dataToSend);
			this.commonService.post(`quantity/20`, dataToSend, false).subscribe({
				next: (response: any) => {
					//	console.log("kejfkejfkejfkejfkefjekf",response)
					this.getData();

					this.goodPartAmount = "";
					this.badPartReasons.forEach((reason: any, reasonIndex) => {
						this.scrapPartAmounts[reasonIndex] = "";
					});
					this.isDataChanged = false;
				},
			});
		}
	}

	saveEdit() {
		let editedData: any;
		editedData = {
			machine_id: "20",
			prod_order_pos_operation_id: 140,
			user_id: "60",
			bad_part_reason_id: "",
			quantity: this.editedValue.quantity,
			item_id: 5516,
			serial: "Batch",
			batch: null,
			stockable_type: "ProdOrderPosOperation::class",
			new_quantity: this.editedGoodPartAmount || this.editedScrapPartAmount,
			confirmed_datetime: this.editedValue.confirmed_datetime,
			new_bad_part_reason_id: null,
			positionable_id: "",
			positionable_type: "",
		};

		this.commonService
			.put(`quantity/${this.editedValue.id}`, editedData, false)

			.subscribe({
				next: (response: any) => {
					this.getData();
					this.editedGoodPartAmount = "";
					this.editedScrapPartAmount = "";
				},
			});
	}

	buildDataToSend(): any[] {
		const dataToSend: any[] = [];
		if (this.goodPartAmount) {
			dataToSend.push({
				prod_order_pos_operation_id: 140,
				user_id: "60",
				bad_part_reason_id: "",
				quantity: this.goodPartAmount,
				item_id: 5516,
				serial: "Batch",
				batch: null,
				stockable_type: "ProdOrderPosOperation::class",
				positionable_id: "",
				positionable_type: "",
			});
			this.goodPartAmount = "";
		}

		this.badPartReasons.forEach((reason: any, index) => {
			if (this.scrapPartAmounts[index]) {
				dataToSend.push({
					prod_order_pos_operation_id: 140,
					user_id: "60",
					bad_part_reason_id: reason.id,
					quantity: this.scrapPartAmounts[index],
					item_id: 5516,
					serial: "Batch",
					batch: null,
					stockable_type: "ProdOrderPosOperation::class",
					positionable_id: "",
					positionable_type: "",
				});
				this.scrapPartAmounts[index] = "";
			}
		});

		return dataToSend;
	}

	deleteRecord(value: any) {
		const urlString = `quantity/${value.id}`;

		this.commonService.delete(urlString, false).subscribe({
			next: () => {
				this.getData();
			},
		});
	}
	isDialogOpen: boolean = false;
	closeDialog() {
		this.isDialogOpen = false;
	}

	openDialog() {
		this.isDialogOpen = true;
	}

	closeEditDialog() {
		this.EditItems = false;
		this.editedGoodPartAmount = "";
		this.editedScrapPartAmount = "";
	}

	// tabChange(event: any) {
	// 	const selectedTabText = event.detail.tab.text;
	// 	if (selectedTabText === 'Type Of Repair') {
	// 		this.selectedTab = 'TypeOfRepair';
	// 	} else {
	// 		this.selectedTab = 'attachment';
	// 	}
	// }
}
