export interface Disbursement {
    disbursement: string;
    date_paid: string;
    disbursements_paid: number | string;
    disbursements_expected: number | string;
    blockchain_tx_url: string;
}

export interface RecentDisbursement {
    most_recent_disbursement: string;
    disbursement_title: string;
    date_paid: string;
    amount_paid: number;
    blockchain_tx_url: string;
}